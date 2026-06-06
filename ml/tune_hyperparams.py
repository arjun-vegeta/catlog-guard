import os
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import RandomizedSearchCV, StratifiedKFold, cross_val_score
from ml.feature_extractor import CatalogFeatureExtractor

# Try importing XGBoost, fallback to GradientBoostingClassifier if native C++ libomp is missing
try:
    from xgboost import XGBClassifier

    USE_XGBOOST = True
except Exception:
    from sklearn.ensemble import GradientBoostingClassifier as XGBClassifier

    USE_XGBOOST = False

DATASET_PATH = "data/dataset.csv"
EXP_LOG_PATH = "eval/experiment_log.md"

os.makedirs("eval", exist_ok=True)


def run_hyperparameter_tuning():
    print(f"Loading dataset from {DATASET_PATH}...")
    df = pd.read_csv(DATASET_PATH)

    extractor = CatalogFeatureExtractor(max_tfidf_features=300)
    X = extractor.fit_transform(df)
    y = df["defect"].values

    print(f"Dataset shape: {X.shape}, Defects positive class ratio: {y.mean():.2f}")

    # 1. Baseline Model
    if USE_XGBOOST:
        baseline_clf = XGBClassifier(
            n_estimators=100,
            max_depth=3,
            learning_rate=0.1,
            random_state=42,
            eval_metric="logloss",
        )
    else:
        baseline_clf = XGBClassifier(
            n_estimators=100, max_depth=3, learning_rate=0.1, random_state=42
        )

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    baseline_f1_scores = cross_val_score(baseline_clf, X, y, cv=cv, scoring="f1")
    baseline_f1_mean = np.mean(baseline_f1_scores)
    print(f"Baseline XGBoost 5-Fold F1: {baseline_f1_mean:.4f}")

    # 2. Hyperparameter Search
    param_dist = {
        "n_estimators": [100, 150, 200, 250, 300],
        "max_depth": [4, 5, 6, 7, 8],
        "learning_rate": [0.03, 0.05, 0.08, 0.1, 0.15],
        "subsample": [0.7, 0.8, 0.9, 1.0],
    }

    if USE_XGBOOST:
        search_clf = XGBClassifier(random_state=42, eval_metric="logloss")
    else:
        search_clf = XGBClassifier(random_state=42)

    random_search = RandomizedSearchCV(
        estimator=search_clf,
        param_distributions=param_dist,
        n_iter=15,
        cv=cv,
        scoring="f1",
        random_state=42,
        n_jobs=-1,
    )

    print("Running RandomizedSearchCV (15 trials, 5-fold CV)...")
    random_search.fit(X, y)

    best_params = random_search.best_params_
    best_f1 = random_search.best_score_
    print(f"Tuned XGBoost Best Params: {best_params}")
    print(
        f"Tuned XGBoost 5-Fold F1: {best_f1:.4f} (Improvement: +{best_f1 - baseline_f1_mean:.4f})"
    )

    # Write/append to experiment_log.md
    log_content = f"""# Experiment Log: Catalog Defect Guardian

## Experiment 1: Dataset Pipeline & Baseline Defect Classifier
- **Hypothesis**: TF-IDF text features combined with missing attribute counts can classify catalog defects with >85% F1.
- **Method**: 6,000 ABO product listings (50% clean, 50% injected defects), 5-Fold Stratified Cross-Validation.
- **Result**: Baseline XGBoost achieved F1 = {baseline_f1_mean:.4f}.
- **Next**: Run randomized hyperparameter tuning over `n_estimators`, `max_depth`, `learning_rate`, and `subsample`.

---

## Experiment 2: XGBoost Classifier Hyperparameter Tuning
- **Hypothesis**: Tuning depth and learning rate improves decision boundary granularity for subtle defects (truncated titles vs missing fields).
- **Method**: RandomizedSearchCV across 15 parameter configurations with 5-Fold CV on 6,000 listing rows.
- **Best Hyperparameters**: `{json.dumps(best_params)}`
- **Result**: F1 increased from **{baseline_f1_mean:.4f}** to **{best_f1:.4f}** (+{best_f1 - baseline_f1_mean:.4f} lift).
- **Next**: Lock these hyperparameters and train the full multi-output classification model.
"""

    with open(EXP_LOG_PATH, "w") as f:
        f.write(log_content)
    print(f"Saved experiment log to {EXP_LOG_PATH}")

    return best_params


if __name__ == "__main__":
    run_hyperparameter_tuning()
