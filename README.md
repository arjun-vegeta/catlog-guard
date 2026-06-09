# Catalog Defect & Compliance Guardian (catalog-guard)

> **Tech Stack:** Python 3.11 | XGBoost | Scikit-Learn | Gemini 3.1 Flash Lite | FastAPI | Streamlit | SQLite | SQL

---

## Overview

**Catalog Defect & Compliance Guardian** is an end-to-end catalog audit engine built on e-commerce product catalog data. It combines high-throughput classical machine learning (**XGBoost Classifier & Quality Score Regressor**) with a **Generative AI explanation layer** powered by **Gemini 3.1 Flash Lite** (via Google AI Studio). 

The system achieves **0.9116 F1-score** on defect detection and predicts a continuous **0–100 listing quality score (RMSE 12.82)**. By executing a **hybrid 2-stage architecture**, the system reduces LLM token costs by **90%+** while providing human-grade Chain-of-Thought (CoT) reasoning and actionable fix recommendations for non-compliant product listings.

---

## Architecture Overview

```
                          ┌─────────────────────────────────────────┐
                          │     Raw Product Listing Metadata       │
                          │   (Title, Brand, Category, Bullets)     │
                          └────────────────────┬────────────────────┘
                                               │
                                               ▼
                                ┌─────────────────────────────┐
                                │     Classical ML Layer      │
                                │   (XGBoost Classifier &     │
                                │    Quality Regressor)       │
                                └──────────────┬──────────────┘
                                               │
                       ┌───────────────────────┴───────────────────────┐
                       │                                               │
         (Compliant: 90% of listings)                       (Defective: 10% flagged)
                       │                                               │
                       ▼                                               ▼
       ┌───────────────────────────────┐               ┌───────────────────────────────┐
       │   Fast Pass Approval         │               │     LLM Explanation Layer     │
       │   (Latency: ~1.2 ms, $0 cost)  │               │   (Gemini 3.1 Flash Lite)     │
       └───────────────────────────────┘               │   → Few-Shot + CoT Reasoning  │
                                                       │   → JSON: Reason & Fix        │
                                                       └───────────────┬───────────────┘
                                                                       │
                                               ┌───────────────────────┘
                                               ▼
                               ┌──────────────────────────────┐
                               │   FastAPI /check-listing     │
                               └───────────────┬──────────────┘
                                               │
                                               ▼
                               ┌──────────────────────────────┐
                               │   SQLite `audit_logs` DB     │
                               └───────────────┬──────────────┘
                                               │
                                               ▼
                               ┌──────────────────────────────┐
                               │  Streamlit Audit Dashboard   │
                               │  (SQL KPI Aggregations)      │
                               └───────────────┬──────────────┘
```

---

## Key Performance Results

| Model / Subsystem | Target Metric | Score | Key Takeaway |
|---|---|---|---|
| **Binary Defect Classifier** | F1-Score | **0.9116** | Precision 0.9595, Recall 0.8683 (Minimizes false flags) |
| **Defect Type Multi-Class** | Accuracy | **92.0%** | Categorizes missing fields, truncated titles, category mismatches |
| **Quality Score Regressor** | RMSE / MAE | **12.82 / 8.57** | Predicts 0–100 quality score continuous scale |
| **Hyperparameter Tuning** | F1 Lift | **+0.0108** | Logged via RandomizedSearchCV (5-fold CV) |
| **LLM Explanation Layer** | Reasoning Format | **Structured JSON** | Gemini 3.1 Flash Lite few-shot + CoT response |
| **Inference Latency** | P95 Latency | **~1.2 ms** | ML triage fast path for bulk ingestion |

---

## Repository Structure

```
catalog-guard/
├── README.md                  # System architecture, performance, and pitch
├── requirements.txt           # Production dependencies
├── data/
│   ├── prepare_dataset.py     # Data parsing & synthetic defect injection script
│   ├── dataset.csv            # Full 6,000-row dataset
│   └── sample_listings.csv    # 200-row sample for testing
├── ml/
│   ├── feature_extractor.py   # TF-IDF + metadata feature engineering pipeline
│   ├── tune_hyperparams.py     # Hyperparameter search with CV logging
│   ├── train_classifier.py    # XGBoost defect & defect_type classifier
│   ├── train_quality_regressor.py # XGBoost 0-100 quality score regressor
│   ├── classifier.pkl         # Trained classifier pipeline bundle
│   └── regressor.pkl          # Trained regressor pipeline bundle
├── llm/
│   ├── prompts.py             # Few-shot + Chain-of-Thought (CoT) templates
│   └── explain.py             # Gemini 3.1 Flash Lite API wrapper & fallback
├── eval/
│   ├── tradeoff_analysis.md   # ML vs GenAI comparative evaluation report
│   └── experiment_log.md      # Quantitative experiment iteration logs
├── api/
│   └── main.py                # FastAPI audit endpoint with SQLite logging
└── dashboard/
    ├── app.py                 # Streamlit monitoring dashboard
    ├── logs.db                # SQLite request log database
    └── queries.sql            # SQL queries for dashboard aggregations
```

---

## Quickstart Guide

### 1. Installation & Environment Setup

```bash
git clone https://github.com/your-username/catalog-guard.git
cd catalog-guard
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Generate Dataset & Train ML Models

```bash
# 1. Download metadata & inject defects
python data/prepare_dataset.py

# 2. Hyperparameter tuning (logged to eval/experiment_log.md)
PYTHONPATH=. python ml/tune_hyperparams.py

# 3. Train Classifier & Quality Regressor
PYTHONPATH=. python ml/train_classifier.py
PYTHONPATH=. python ml/train_quality_regressor.py
```

### 3. Run FastAPI Service

```bash
uvicorn api.main:app --reload --port 8000
```
- Open Swagger API Docs: `http://localhost:8000/docs`
- Test endpoint: `POST http://localhost:8000/check-listing`

### 4. Launch Streamlit Monitoring Dashboard

```bash
streamlit run dashboard/app.py
```
- View live analytics, run real-time listing audits, inspect SQL queries, and view the ML-vs-GenAI trade-off paper.

---

## SQL-Backed Analytics

All audit requests and predictions are logged to a local **SQLite** database (`dashboard/logs.db`). Dashboard aggregations are computed using raw SQL queries stored in [`dashboard/queries.sql`](file:///Users/arjun/Desktop/catalog-guard/dashboard/queries.sql):

```sql
-- Defect Type Breakdown Query
SELECT 
    defect_type,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM audit_logs), 2) as percentage
FROM audit_logs
GROUP BY defect_type
ORDER BY count DESC;
```

---

## Key Artifacts

- **[Trade-off Evaluation Document](file:///Users/arjun/Desktop/catalog-guard/eval/tradeoff_analysis.md):** Detailed analysis on cost, latency, accuracy, and explainability trade-offs between Classical ML and GenAI LLMs.
- **[Experiment Log](file:///Users/arjun/Desktop/catalog-guard/eval/experiment_log.md):** Iterative experimentation metrics (baseline vs tuned XGBoost, precision/recall trade-offs, regressor RMSE).

---

## License

Distributed under the MIT License. Open-access e-commerce product catalog metadata.
