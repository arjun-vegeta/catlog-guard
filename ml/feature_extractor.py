import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import hstack, csr_matrix

CATEGORY_KEYWORDS = {
    "SHOES": [
        "shoe",
        "boot",
        "pump",
        "sneaker",
        "heel",
        "sandal",
        "loafer",
        "footwear",
        "stiletto",
    ],
    "HARDWARE": [
        "slide",
        "hinge",
        "screw",
        "mount",
        "lock",
        "bolt",
        "hardware",
        "bracket",
        "drawer",
    ],
    "MECHANICAL_COMPONENTS": [
        "filament",
        "3d printer",
        "bearing",
        "spool",
        "gear",
        "shaft",
        "coupling",
    ],
    "SOFA": ["sofa", "couch", "loveseat", "sectional"],
    "HOME_FURNITURE": [
        "chair",
        "table",
        "desk",
        "cabinet",
        "shelf",
        "bed",
        "dresser",
        "stand",
        "ottoman",
        "armchair",
        "furniture",
    ],
    "ELECTRONICS": [
        "cable",
        "adapter",
        "charger",
        "phone",
        "audio",
        "speaker",
        "headphone",
        "monitor",
        "screen",
    ],
    "CLOTHING": [
        "shirt",
        "dress",
        "pants",
        "jacket",
        "coat",
        "sweater",
        "top",
        "blouse",
        "skirt",
    ],
    "BEAUTY": [
        "cream",
        "serum",
        "lotion",
        "lipstick",
        "makeup",
        "shampoo",
        "moisturizer",
        "perfume",
    ],
    "KITCHEN": [
        "pan",
        "pot",
        "knife",
        "blender",
        "cookware",
        "utensil",
        "bowl",
        "plate",
        "mug",
    ],
    "OFFICE_PRODUCTS": [
        "binder",
        "paper",
        "pen",
        "organizer",
        "folder",
        "stapler",
        "planner",
        "notebook",
    ],
}


class CatalogFeatureExtractor:
    def __init__(self, max_tfidf_features=300):
        self.max_tfidf_features = max_tfidf_features
        self.vectorizer = TfidfVectorizer(
            max_features=max_tfidf_features,
            stop_words="english",
            token_pattern=r"(?u)\b\w+\b",
        )
        self.is_fitted = False

    def _extract_dense_features(self, df):
        features = []
        for idx, row in df.iterrows():
            title = str(row.get("title", "") or "")
            bullets = str(row.get("bullet_points", "") or "")
            brand = str(row.get("brand", "") or "")
            ptype = str(row.get("product_type", "") or "").upper()
            color = str(row.get("color", "") or "")
            material = str(row.get("material", "") or "")
            dims = str(row.get("item_dimensions", "") or "")

            title_len = len(title)
            title_words = len(title.split())
            bullets_len = len(bullets)
            bullets_words = len(bullets.split())

            missing_brand = (
                1
                if (not brand or brand.lower() in ["generic", "none", "n/a", ""])
                else 0
            )
            missing_material = (
                1 if (not material or material.lower() in ["none", "n/a", ""]) else 0
            )
            missing_color = (
                1 if (not color or color.lower() in ["none", "n/a", ""]) else 0
            )
            missing_dims = 1 if (not dims or dims.lower() in ["none", "n/a", ""]) else 0
            missing_bullets = 1 if (not bullets or len(bullets) < 10) else 0

            missing_count = (
                missing_brand
                + missing_material
                + missing_color
                + missing_dims
                + missing_bullets
            )
            truncated_title_flag = 1 if (title_words <= 3 or title_len < 15) else 0

            # Category mismatch feature
            mismatch_flag = 0
            if ptype in CATEGORY_KEYWORDS:
                expected_kw = CATEGORY_KEYWORDS[ptype]
                title_lower = title.lower()
                # Check if title mentions words from other categories strongly
                matches_own = any(kw in title_lower for kw in expected_kw)
                other_matches = 0
                for cat, kws in CATEGORY_KEYWORDS.items():
                    if cat != ptype:
                        if any(kw in title_lower for kw in kws):
                            other_matches += 1
                if not matches_own and other_matches > 0:
                    mismatch_flag = 1

            # Duplicate / repetitive text flag
            duplicate_flag = 0
            if title_words > 4:
                half = title_words // 2
                first_half = " ".join(title.split()[:half]).lower()
                second_half = " ".join(title.split()[half:]).lower()
                if first_half in second_half or second_half in first_half:
                    duplicate_flag = 1

            row_feats = [
                title_len,
                title_words,
                bullets_len,
                bullets_words,
                missing_brand,
                missing_material,
                missing_color,
                missing_dims,
                missing_bullets,
                missing_count,
                truncated_title_flag,
                mismatch_flag,
                duplicate_flag,
            ]
            features.append(row_feats)

        return np.array(features, dtype=np.float32)

    def fit(self, df):
        text_corpus = (
            df["title"].fillna("")
            + " "
            + df["bullet_points"].fillna("")
            + " "
            + df["brand"].fillna("")
            + " "
            + df["product_type"].fillna("")
        )
        self.vectorizer.fit(text_corpus)
        self.is_fitted = True
        return self

    def transform(self, df):
        if not self.is_fitted:
            raise ValueError("Extractor must be fitted before calling transform()")

        text_corpus = (
            df["title"].fillna("")
            + " "
            + df["bullet_points"].fillna("")
            + " "
            + df["brand"].fillna("")
            + " "
            + df["product_type"].fillna("")
        )
        tfidf_mat = self.vectorizer.transform(text_corpus)
        dense_feats = self._extract_dense_features(df)

        # Combine sparse TF-IDF and dense features
        X_combined = hstack([tfidf_mat, csr_matrix(dense_feats)])
        return X_combined

    def fit_transform(self, df):
        return self.fit(df).transform(df)
