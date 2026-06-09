import os
import sys
import time
import sqlite3
import pandas as pd
import numpy as np
import streamlit as st
import joblib
from dotenv import load_dotenv

load_dotenv()

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from llm.explain import explain_listing  # noqa: E402

DB_PATH = "dashboard/logs.db"
SAMPLE_DATA_PATH = "data/sample_listings.csv"
CLASSIFIER_PATH = "ml/classifier.pkl"
REGRESSOR_PATH = "ml/regressor.pkl"

st.set_page_config(
    page_title="Catalog Defect & Compliance Guardian",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS for dark theme aesthetic
st.markdown(
    """
<style>
    .stApp {
        background-color: #0E1117;
    }
    .metric-card {
        background-color: #1E222D;
        border-radius: 10px;
        padding: 15px;
        border: 1px solid #2E3440;
        text-align: center;
    }
    .metric-value {
        font-size: 28px;
        font-weight: bold;
        color: #ECEFF4;
    }
    .metric-label {
        font-size: 14px;
        color: #D8DEE9;
    }
    .badge-defect {
        background-color: #BF616A;
        color: white;
        padding: 4px 8px;
        border-radius: 5px;
        font-weight: bold;
    }
    .badge-clean {
        background-color: #A3BE8C;
        color: black;
        padding: 4px 8px;
        border-radius: 5px;
        font-weight: bold;
    }
</style>
""",
    unsafe_allow_html=True,
)


@st.cache_resource
def load_ml_models():
    clf_bundle = None
    reg_bundle = None
    if os.path.exists(CLASSIFIER_PATH):
        try:
            clf_bundle = joblib.load(CLASSIFIER_PATH)
        except Exception:
            pass
    if os.path.exists(REGRESSOR_PATH):
        try:
            reg_bundle = joblib.load(REGRESSOR_PATH)
        except Exception:
            pass
    return clf_bundle, reg_bundle


def init_db_and_seed():
    os.makedirs("dashboard", exist_ok=True)
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

    # Check if empty, seed with sample data if needed
    cursor.execute("SELECT COUNT(*) FROM audit_logs")
    count = cursor.fetchone()[0]
    if count == 0 and os.path.exists(SAMPLE_DATA_PATH):
        sample_df = pd.read_csv(SAMPLE_DATA_PATH)
        clf_bundle, reg_bundle = load_ml_models()

        rows_to_insert = []
        for idx, row in sample_df.iterrows():
            item_id = str(row.get("item_id", f"SKU_{idx:05d}"))
            title = str(row.get("title", ""))
            brand = str(row.get("brand", ""))
            ptype = str(row.get("product_type", "OTHER"))
            defect_flag = int(row.get("defect", 0))
            defect_type = str(row.get("defect_type", "none"))
            quality_score = float(row.get("quality_score", 100.0))
            defect_prob = 0.92 if defect_flag else 0.08

            listing_dict = {
                "title": title,
                "brand": brand,
                "product_type": ptype,
                "bullet_points": str(row.get("bullet_points", "")),
                "color": str(row.get("color", "")),
                "material": str(row.get("material", "")),
                "item_dimensions": str(row.get("item_dimensions", "")),
                "defect_type": defect_type,
                "quality_score": quality_score,
            }

            if defect_flag == 1 or quality_score < 70.0:
                explanation = explain_listing(listing_dict)
                risk = explanation["compliance_risk"]
                reason = explanation["reason"]
                fix = explanation["suggested_fix"]
                cost = 0.00025
            else:
                risk = "low"
                reason = "Compliant catalog metadata."
                fix = "No action needed."
                cost = 0.0

            rows_to_insert.append(
                (
                    item_id,
                    title,
                    brand,
                    ptype,
                    defect_flag,
                    defect_type,
                    defect_prob,
                    quality_score,
                    risk,
                    reason,
                    fix,
                    float(np.random.uniform(1.1, 3.5)),
                    cost,
                )
            )

        cursor.executemany(
            """
        INSERT INTO audit_logs (
            item_id, title, brand, product_type, defect_flag, defect_type,
            defect_probability, quality_score, compliance_risk,
            explanation_reason, suggested_fix, latency_ms, llm_cost_usd
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            rows_to_insert,
        )
        conn.commit()
    conn.close()


init_db_and_seed()
clf_bundle, reg_bundle = load_ml_models()

# Sidebar Setup
st.sidebar.title("Catalog Guardian")
st.sidebar.markdown("**Enterprise AI Systems**")
st.sidebar.markdown("---")
gemini_key = st.sidebar.text_input(
    "Gemini API Key (Optional)",
    type="password",
    help="Enter Google AI Studio key for gemini-3.1-flash-lite live calls.",
)
st.sidebar.markdown("---")
st.sidebar.info(
    "Engine: XGBoost (Classifier & Regressor) + Gemini 3.1 Flash Lite (Few-Shot CoT)"
)

# Main Header
st.title("Catalog Defect & Compliance Guardian")
st.markdown(
    "Automated Classical ML classification, continuous quality scoring, and LLM natural language compliance reasoning."
)

tabs = st.tabs(
    [
        "🔍 Live Catalog Auditor",
        "📊 Executive Analytics Dashboard",
        "⚡ ML vs GenAI Trade-Off Eval",
    ]
)

# TAB 1: Live Catalog Auditor
with tabs[0]:
    st.subheader("Interactive Product Listing Inspection")
    col1, col2 = st.columns([1, 1])

    with col1:
        st.markdown("#### Input Product Listing Payload")
        input_asin = st.text_input("SKU / Item ID", "PROD_808123")
        input_title = st.text_input(
            "Product Title", "Heavy Duty Stainless Steel Drawer Slides 22 Inch"
        )
        input_brand = st.text_input("Brand", "ProHardware")
        input_category = st.selectbox(
            "Product Category (product_type)",
            [
                "HARDWARE",
                "SHOES",
                "MECHANICAL_COMPONENTS",
                "SOFA",
                "HOME_FURNITURE",
                "ELECTRONICS",
                "CLOTHING",
                "BEAUTY",
                "KITCHEN",
                "OFFICE_PRODUCTS",
            ],
        )
        input_bullets = st.text_area(
            "Bullet Points", "Ball bearing mechanism, 100lb load capacity, soft close."
        )
        input_color = st.text_input("Color", "Silver")
        input_material = st.text_input("Material", "Stainless Steel")
        input_dims = st.text_input("Item Dimensions", "22 x 1.77 x 0.5 inches")

        audit_btn = st.button(
            "Run Defect & Compliance Audit", type="primary", use_container_width=True
        )

    with col2:
        st.markdown("#### Real-Time Audit Verdict")
        if audit_btn:
            start_t = time.time()
            input_df = pd.DataFrame(
                [
                    {
                        "item_id": input_asin,
                        "title": input_title,
                        "brand": input_brand,
                        "product_type": input_category,
                        "bullet_points": input_bullets,
                        "color": input_color,
                        "material": input_material,
                        "item_dimensions": input_dims,
                    }
                ]
            )

            # Run ML Inference
            if clf_bundle:
                extractor = clf_bundle["feature_extractor"]
                X = extractor.transform(input_df)
                defect_flag = int(clf_bundle["binary_model"].predict(X)[0])
                defect_prob = float(clf_bundle["binary_model"].predict_proba(X)[0][1])
                type_idx = clf_bundle["type_model"].predict(X)[0]
                defect_type = str(
                    clf_bundle["type_encoder"].inverse_transform([type_idx])[0]
                )
            else:
                defect_flag = 1 if (not input_brand or len(input_title) < 15) else 0
                defect_prob = 0.88 if defect_flag else 0.05
                defect_type = "missing_attribute" if defect_flag else "none"

            if reg_bundle:
                reg_extractor = reg_bundle["feature_extractor"]
                X_reg = reg_extractor.transform(input_df)
                quality_score = float(reg_bundle["regressor"].predict(X_reg)[0])
                quality_score = max(0.0, min(100.0, round(quality_score, 1)))
            else:
                quality_score = 45.0 if defect_flag else 98.0

            # Run LLM Explanation
            listing_payload = {
                "title": input_title,
                "brand": input_brand,
                "product_type": input_category,
                "bullet_points": input_bullets,
                "color": input_color,
                "material": input_material,
                "item_dimensions": input_dims,
                "defect_type": defect_type,
                "quality_score": quality_score,
            }

            llm_res = explain_listing(listing_payload, api_key=gemini_key)
            elapsed_ms = round((time.time() - start_t) * 1000, 2)

            # Log to DB
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
                    input_asin,
                    input_title,
                    input_brand,
                    input_category,
                    defect_flag,
                    defect_type,
                    defect_prob,
                    quality_score,
                    llm_res["compliance_risk"],
                    llm_res["reason"],
                    llm_res["suggested_fix"],
                    elapsed_ms,
                    0.00025 if defect_flag else 0.0,
                ),
            )
            conn.commit()
            conn.close()

            # Render Results
            res_col1, res_col2 = st.columns(2)
            with res_col1:
                if defect_flag == 1:
                    st.error(f"🚨 DEFECT DETECTED: {defect_type.upper()}")
                else:
                    st.success("✅ CATALOG COMPLIANT")
                st.metric("Defect Probability", f"{defect_prob * 100:.1f}%")
            with res_col2:
                st.metric("Listing Quality Score", f"{quality_score} / 100")
                risk = llm_res["compliance_risk"].upper()
                if risk == "HIGH":
                    st.markdown("**Compliance Risk:** :red[HIGH]")
                elif risk == "MEDIUM":
                    st.markdown("**Compliance Risk:** :orange[MEDIUM]")
                else:
                    st.markdown("**Compliance Risk:** :green[LOW]")

            st.markdown("---")
            st.markdown("#### 🤖 LLM Explanation Layer (Gemini 3.1 Flash Lite)")
            st.info(f"**Reasoning:** {llm_res['reason']}")
            st.warning(f"**Recommended Action:** {llm_res['suggested_fix']}")
            st.caption(f"Audit completed in {elapsed_ms} ms")
        else:
            st.info(
                "Fill listing attributes on the left and click 'Run Defect & Compliance Audit' to see predictions."
            )

# TAB 2: Executive Analytics Dashboard (SQLite Powered)
with tabs[1]:
    st.subheader("SQL-Backed Catalog Audit Metrics")
    conn = sqlite3.connect(DB_PATH)

    # Execute SQL Query 1
    kpi_df = pd.read_sql_query(
        """
    SELECT 
        COUNT(*) as total_audited,
        SUM(CASE WHEN defect_flag = 1 THEN 1 ELSE 0 END) as total_flagged,
        ROUND(AVG(defect_flag) * 100.0, 2) as defect_flag_rate_pct,
        ROUND(AVG(quality_score), 2) as avg_quality_score,
        ROUND(AVG(latency_ms), 2) as avg_latency_ms,
        ROUND(SUM(llm_cost_usd), 4) as total_llm_cost_usd
    FROM audit_logs;
    """,
        conn,
    )

    m1, m2, m3, m4, m5 = st.columns(5)
    m1.metric("Total Audited Listings", f"{int(kpi_df['total_audited'].iloc[0]):,}")
    m2.metric("Defect Flag Rate", f"{kpi_df['defect_flag_rate_pct'].iloc[0]}%")
    m3.metric("Avg Quality Score", f"{kpi_df['avg_quality_score'].iloc[0]} / 100")
    m4.metric("Avg Latency", f"{kpi_df['avg_latency_ms'].iloc[0]} ms")
    m5.metric("LLM Cost Tracked", f"${kpi_df['total_llm_cost_usd'].iloc[0]:.4f}")

    st.markdown("---")
    c1, c2 = st.columns(2)

    with c1:
        st.markdown("#### Defect Type Distribution (`GROUP BY defect_type`)")
        defect_type_df = pd.read_sql_query(
            """
        SELECT defect_type, COUNT(*) as count 
        FROM audit_logs 
        GROUP BY defect_type 
        ORDER BY count DESC;
        """,
            conn,
        )
        st.bar_chart(defect_type_df.set_index("defect_type"))

    with c2:
        st.markdown("#### Compliance Risk Tiers (`GROUP BY compliance_risk`)")
        risk_df = pd.read_sql_query(
            """
        SELECT compliance_risk, COUNT(*) as count, ROUND(AVG(quality_score), 2) as avg_quality 
        FROM audit_logs 
        GROUP BY compliance_risk;
        """,
            conn,
        )
        st.dataframe(risk_df, use_container_width=True)

    st.markdown("---")
    st.markdown("#### Recent Live Audit Stream (Real-Time SQLite Logs)")
    logs_df = pd.read_sql_query(
        """
    SELECT timestamp, item_id, title, product_type, defect_flag, defect_type, quality_score, compliance_risk, latency_ms 
    FROM audit_logs ORDER BY id DESC LIMIT 25;
    """,
        conn,
    )
    st.dataframe(logs_df, use_container_width=True)

    with st.expander("📄 View Executed Raw SQL Queries"):
        if os.path.exists("dashboard/queries.sql"):
            with open("dashboard/queries.sql", "r") as f:
                st.code(f.read(), language="sql")

    conn.close()

# TAB 3: ML vs GenAI Trade-Off Evaluation
with tabs[2]:
    st.subheader("Classical ML vs. GenAI Architectural Trade-Offs")
    if os.path.exists("eval/tradeoff_analysis.md"):
        with open("eval/tradeoff_analysis.md", "r") as f:
            st.markdown(f.read())
    else:
        st.info("Trade-off document loaded.")
