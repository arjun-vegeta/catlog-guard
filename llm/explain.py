import os
import json
import re
from dotenv import load_dotenv
from llm.prompts import FEW_SHOT_COT_PROMPT

load_dotenv()

# Attempt loading google-genai SDK
try:
    from google import genai
    from google.genai import types

    HAS_GENAI_SDK = True
except ImportError:
    HAS_GENAI_SDK = False

GEMINI_MODEL = "gemini-3.1-flash-lite"


def _clean_json_text(text: str) -> str:
    text = text.strip()
    # Strip markdown block if present
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*\n?", "", text)
        text = re.sub(r"\n?```$", "", text)
    return text.strip()


def _rule_based_fallback_explanation(listing_dict: dict) -> dict:
    defect_type = listing_dict.get("defect_type", "unknown")
    title = str(listing_dict.get("title", ""))
    brand = str(listing_dict.get("brand", ""))
    material = str(listing_dict.get("material", ""))
    ptype = str(listing_dict.get("product_type", ""))

    if defect_type == "missing_attribute":
        missing_fields = []
        if not brand or brand.lower() in ["generic", "none", ""]:
            missing_fields.append("brand")
        if not material or material.lower() in ["none", ""]:
            missing_fields.append("material")
        if not listing_dict.get("color"):
            missing_fields.append("color")
        field_str = (
            ", ".join(missing_fields) if missing_fields else "required attributes"
        )
        return {
            "reason": f"Catalog listing is missing mandatory metadata attribute(s): {field_str}.",
            "suggested_fix": f"Update listing payload to populate missing attribute values ({field_str}).",
            "compliance_risk": "medium" if len(missing_fields) <= 1 else "high",
        }
    elif defect_type == "truncated_title":
        return {
            "reason": f"Product title '{title}' is unusually short (<15 characters) or truncated mid-sentence, reducing customer discoverability.",
            "suggested_fix": "Expand title to include full brand, product model, key specs, and category keywords (50-150 characters).",
            "compliance_risk": "high",
        }
    elif defect_type == "category_mismatch":
        return {
            "reason": f"Declared product category '{ptype}' appears inconsistent with item title and feature bullet descriptions.",
            "suggested_fix": "Re-evaluate product taxonomy and update product_type attribute to align with listing description.",
            "compliance_risk": "high",
        }
    elif defect_type == "duplicate":
        return {
            "reason": "Listing title or feature bullet points contain repetitive duplicated phrases.",
            "suggested_fix": "Deduplicate repeated text fragments in item_name and bullet_points fields.",
            "compliance_risk": "low",
        }
    else:
        return {
            "reason": "Listing passes automated defect screening rules with standard catalog formatting.",
            "suggested_fix": "No remediation required. Maintain current metadata format.",
            "compliance_risk": "low",
        }


def explain_listing(listing_dict: dict, api_key: str = None) -> dict:
    """
    Generates a structured LLM explanation for a catalog listing using Gemini 3.1 Flash Lite.
    Falls back to deterministic rule-based explanation if API key is unavailable or error occurs.
    """
    key = api_key or os.environ.get("GEMINI_API_KEY")

    if not key or not HAS_GENAI_SDK:
        return _rule_based_fallback_explanation(listing_dict)

    prompt = FEW_SHOT_COT_PROMPT.format(
        title=listing_dict.get("title", ""),
        brand=listing_dict.get("brand", ""),
        product_type=listing_dict.get("product_type", ""),
        bullet_points=listing_dict.get("bullet_points", ""),
        color=listing_dict.get("color", ""),
        material=listing_dict.get("material", ""),
        item_dimensions=listing_dict.get("item_dimensions", ""),
        defect_type=listing_dict.get("defect_type", "flagged"),
        quality_score=listing_dict.get("quality_score", 50.0),
    )

    try:
        client = genai.Client(api_key=key)
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2, response_mime_type="application/json"
            ),
        )

        raw_text = response.text
        cleaned = _clean_json_text(raw_text)
        data = json.loads(cleaned)

        # Validate fields
        return {
            "reason": data.get("reason", "No reason provided."),
            "suggested_fix": data.get("suggested_fix", "No fix provided."),
            "compliance_risk": data.get("compliance_risk", "medium").lower(),
        }
    except Exception as e:
        print(
            f"Gemini API call notice: {e}. Utilizing fallback rule-based explanation."
        )
        return _rule_based_fallback_explanation(listing_dict)
