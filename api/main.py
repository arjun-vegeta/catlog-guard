import os
import sqlite3
import time
import joblib
import pandas as pd
from typing import Optional

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

from fastapi import FastAPI  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from pydantic import BaseModel, Field  # noqa: E402

from llm.explain import explain_listing  # noqa: E402

DB_PATH = "dashboard/logs.db"
CLASSIFIER_PATH = "ml/classifier.pkl"
REGRESSOR_PATH = "ml/regressor.pkl"

os.makedirs("dashboard", exist_ok=True)


# Initialize SQLite database schema
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        item_id TEXT,
        title TEXT,
        brand TEXT,
        product_type TEXT,
        defect_flag INTEGER,
        defect_type TEXT,
        defect_probability REAL,
        quality_score REAL,
        compliance_risk TEXT,
        explanation_reason TEXT,
        suggested_fix TEXT,
        latency_ms REAL,
        llm_cost_usd REAL
    )
    """)
    conn.commit()
    conn.close()


init_db()

# Load ML Models
classifier_bundle = None
regressor_bundle = None

try:
    classifier_bundle = joblib.load(CLASSIFIER_PATH)
    print("Classifier model bundle loaded successfully.")
except Exception as e:
    print(
        f"Warning: Could not load classifier model ({e}). ML predictions will fallback."
    )

try:
    regressor_bundle = joblib.load(REGRESSOR_PATH)
    print("Regressor model bundle loaded successfully.")
except Exception as e:
    print(
        f"Warning: Could not load regressor model ({e}). Quality score will fallback."
    )

app = FastAPI(
    title="Catalog Defect & Compliance Guardian API",
    description="Production endpoint for product catalog defect detection, continuous quality scoring, and LLM explanation layer.",
    version="1.0.0",
)

allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
allowed_origins = [
    origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()
]

default_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
for default_origin in default_origins:
    if default_origin not in allowed_origins:
        allowed_origins.append(default_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ListingRequest(BaseModel):
    item_id: str = Field(default="PROD_808123", description="Product Item ID or SKU")
    title: str = Field(..., description="Product Listing Title")
    brand: Optional[str] = Field(default="", description="Product Brand Name")
    product_type: str = Field(..., description="Product Category / Taxonomy Type")
    bullet_points: Optional[str] = Field(
        default="", description="Bullet points description"
    )
    color: Optional[str] = Field(default="", description="Product Color")
    material: Optional[str] = Field(default="", description="Product Material")
    item_dimensions: Optional[str] = Field(default="", description="Product Dimensions")
    api_key: Optional[str] = Field(default=None, description="Optional Gemini API key")


class ListingResponse(BaseModel):
    item_id: str
    defect_flag: int
    defect_type: str
    defect_probability: float
    quality_score: float
    compliance_risk: str
    reason: str
    suggested_fix: str
    latency_ms: float


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Catalog Defect & Compliance Guardian",
        "version": "1.0.0",
        "models_loaded": classifier_bundle is not None and regressor_bundle is not None,
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "db_status": os.path.exists(DB_PATH),
        "classifier_status": classifier_bundle is not None,
        "regressor_status": regressor_bundle is not None,
    }


@app.post("/check-listing", response_model=ListingResponse)
def check_listing(request: ListingRequest):
    start_time = time.time()

    row = {
        "item_id": request.item_id,
        "title": request.title,
        "brand": request.brand or "",
        "product_type": request.product_type,
        "bullet_points": request.bullet_points or "",
        "color": request.color or "",
        "material": request.material or "",
        "item_dimensions": request.item_dimensions or "",
    }

    df = pd.DataFrame([row])

    # 1. Predict ML Binary Defect & Defect Type
    if classifier_bundle:
        extractor = classifier_bundle["feature_extractor"]
        binary_model = classifier_bundle["binary_model"]
        type_model = classifier_bundle["type_model"]
        type_encoder = classifier_bundle["type_encoder"]

        X = extractor.transform(df)
        defect_flag = int(binary_model.predict(X)[0])
        defect_prob = float(binary_model.predict_proba(X)[0][1])

        type_idx = type_model.predict(X)[0]
        defect_type = str(type_encoder.inverse_transform([type_idx])[0])
    else:
        defect_flag = 1 if (not request.brand or len(request.title) < 15) else 0
        defect_prob = 0.85 if defect_flag else 0.10
        defect_type = "missing_attribute" if defect_flag else "none"

    # 2. Predict ML Quality Score
    if regressor_bundle:
        reg_extractor = regressor_bundle["feature_extractor"]
        reg_model = regressor_bundle["regressor"]
        X_reg = reg_extractor.transform(df)
        quality_score = float(reg_model.predict(X_reg)[0])
        quality_score = max(0.0, min(100.0, round(quality_score, 1)))
    else:
        quality_score = 50.0 if defect_flag else 95.0

    # 3. LLM Explanation Layer (Gemini 3.1 Flash Lite)
    listing_data = row.copy()
    listing_data["defect_type"] = defect_type
    listing_data["quality_score"] = quality_score

    llm_cost = 0.0
    if defect_flag == 1 or quality_score < 70.0:
        llm_result = explain_listing(listing_data, api_key=request.api_key)
        compliance_risk = llm_result["compliance_risk"]
        reason = llm_result["reason"]
        suggested_fix = llm_result["suggested_fix"]
        llm_cost = 0.00025
    else:
        compliance_risk = "low"
        reason = "Listing satisfies standard catalog compliance guidelines."
        suggested_fix = "No action required."

    elapsed_ms = round((time.time() - start_time) * 1000, 2)

    # 4. Log request to SQLite Database
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            """
        INSERT INTO audit_logs (
            item_id, title, brand, product_type, defect_flag, defect_type,
            defect_probability, quality_score, compliance_risk,
            explanation_reason, suggested_fix, latency_ms, llm_cost_usd
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                request.item_id,
                request.title,
                request.brand or "",
                request.product_type,
                defect_flag,
                defect_type,
                defect_prob,
                quality_score,
                compliance_risk,
                reason,
                suggested_fix,
                elapsed_ms,
                llm_cost,
            ),
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error logging to SQLite DB: {e}")

    return ListingResponse(
        item_id=request.item_id,
        defect_flag=defect_flag,
        defect_type=defect_type,
        defect_probability=round(defect_prob, 4),
        quality_score=quality_score,
        compliance_risk=compliance_risk,
        reason=reason,
        suggested_fix=suggested_fix,
        latency_ms=elapsed_ms,
    )
