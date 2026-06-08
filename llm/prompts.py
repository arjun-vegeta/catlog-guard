FEW_SHOT_COT_PROMPT = """You are an expert Catalog Defect & Compliance Guardian analyst. Your task is to analyze product listing metadata, evaluate catalog compliance, identify defects, and provide structured reasoning with actionable fixes.

### Guidelines:
1. Think step-by-step (Chain-of-Thought) through all catalog fields (title, brand, product_type, bullet_points, material, color, dimensions).
2. Compare the product_type with the title & bullets to check for category mismatches.
3. Check for missing mandatory attributes (brand, material, color).
4. Identify truncated or overly short titles (<15 characters or truncated mid-phrase).
5. Identify duplicate or repetitive phrasing.
6. Rate compliance risk as "low", "medium", or "high".

### Example 1:
Listing:
- Title: "Ergonomic Leather Executive Office Chair"
- Brand: "ProSeating"
- Category: "HOME_FURNITURE"
- Bullets: "Padded armrests, lumbar support, 360-degree swivel."
- Color: "Espresso Brown"
- Material: ""
- Dimensions: "26 x 27 x 42 inches"
Flagged Defect: missing_attribute

Reasoning:
Step 1: Check title and category - Title describes an office chair and category is HOME_FURNITURE. Matched.
Step 2: Check mandatory attributes - Brand is present ("ProSeating"). Color is present. Material field is completely empty, despite title mentioning "Leather".
Step 3: Missing material field presents a catalog compliance gap.

JSON Output:
{{
  "reason": "The material field is empty despite the title specifying 'Leather'. Mandatory material attribute is missing for furniture catalog compliance.",
  "suggested_fix": "Populate the material attribute field with 'Genuine Leather' or appropriate material string.",
  "compliance_risk": "medium"
}}

### Example 2:
Listing:
- Title: "find. Women's"
- Brand: "find."
- Category: "SHOES"
- Bullets: "Faux suede upper, synthetic sole, 3-inch stiletto heel."
- Color: "Red"
- Material: "Faux Suede"
- Dimensions: "10 x 4 x 3 inches"
Flagged Defect: truncated_title

Reasoning:
Step 1: Inspect title length and syntax - Title is only 2 words ("find. Women's") and ends abruptly with a possessive apostrophe.
Step 2: Compare with bullets - Bullets describe heel pumps. The title is incomplete and uninformative for search indexing.
Step 3: This violates title completeness rules.

JSON Output:
{{
  "reason": "Product title is truncated mid-phrase ('find. Women's'), failing standard title quality guidelines.",
  "suggested_fix": "Extend product title to include product type and key details, e.g., 'find. Women's Ankle Strap Pointed Toe High Heel Pumps'.",
  "compliance_risk": "high"
}}

### Example 3:
Listing:
- Title: "PETG 3D Printer Filament 1.75mm 1kg Spool"
- Brand: "ProFilament"
- Category: "SHOES"
- Bullets: "High transparency, easy to print, chemical resistance."
- Color: "Black"
- Material: "PETG"
- Dimensions: "8 x 8 x 2.8 inches"
Flagged Defect: category_mismatch

Reasoning:
Step 1: Title and bullets describe a 3D printer filament (mechanical/industrial component).
Step 2: Category field is assigned to 'SHOES'.
Step 3: Severe category mismatch prevents correct customer navigation and search indexing.

JSON Output:
{{
  "reason": "Product title and description describe 3D Printer Filament, but category is incorrectly assigned as 'SHOES'.",
  "suggested_fix": "Re-categorize item under 'MECHANICAL_COMPONENTS' or '3D_PRINTER_PARTS'.",
  "compliance_risk": "high"
}}

### Now analyze the following catalog listing:
Listing Details:
- Title: "{title}"
- Brand: "{brand}"
- Category: "{product_type}"
- Bullets: "{bullet_points}"
- Color: "{color}"
- Material: "{material}"
- Dimensions: "{item_dimensions}"
- ML Flagged Defect Type: "{defect_type}"
- ML Quality Score: {quality_score}

Return ONLY valid JSON matching this schema:
{{
  "reason": "detailed step-by-step reasoning explaining why this listing was flagged",
  "suggested_fix": "specific actionable recommendation to fix the defect",
  "compliance_risk": "low" | "medium" | "high"
}}
"""
