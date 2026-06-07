# Experiment Log: Catalog Defect Guardian

## Experiment 1: Dataset Pipeline & Baseline Defect Classifier
- **Hypothesis**: TF-IDF text features combined with missing attribute counts can classify catalog defects with >85% F1.
- **Method**: 6,000 ABO product listings (50% clean, 50% injected defects), 5-Fold Stratified Cross-Validation.
- **Result**: Baseline XGBoost achieved F1 = 0.9034.
- **Next**: Run randomized hyperparameter tuning over `n_estimators`, `max_depth`, `learning_rate`, and `subsample`.

---

## Experiment 2: XGBoost Classifier Hyperparameter Tuning
- **Hypothesis**: Tuning depth and learning rate improves decision boundary granularity for subtle defects (truncated titles vs missing fields).
- **Method**: RandomizedSearchCV across 15 parameter configurations with 5-Fold CV on 6,000 listing rows.
- **Best Hyperparameters**: `{"subsample": 1.0, "n_estimators": 250, "max_depth": 6, "learning_rate": 0.05}`
- **Result**: F1 increased from **0.9034** to **0.9133** (+0.0099 lift).
- **Next**: Lock these hyperparameters and train the full multi-output classification model.

## Experiment 3: Final XGBoost Classifier Evaluation
- **Method**: 80/20 train/test split on 6,000 ABO listings.
- **Test Metrics**: Precision=0.9596, Recall=0.8717, F1-Score=0.9135.
- **Outcome**: High precision ensures low false positive rate on compliant catalog items.

## Experiment 4: Continuous Listing Quality Regressor
- **Hypothesis**: Predicting a continuous 0-100 quality score captures defect severity beyond binary flagging.
- **Method**: XGBoost Regressor trained on injected defect penalty scores with 80/20 train/test split.
- **Test Metrics**: RMSE = 13.1210, MAE = 8.7013, R² = 0.6543.
- **Conclusion**: Low quality scores (<60) correlate strongly with binary defect flags, enabling fine-grained compliance tiering.
