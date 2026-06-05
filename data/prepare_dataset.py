import json
import gzip
import urllib.request
import os
import random
import pandas as pd
import numpy as np

# Ensure directory exists
os.makedirs("data", exist_ok=True)

S3_ABO_URL = "https://amazon-berkeley-objects.s3.amazonaws.com/listings/metadata/listings_0.json.gz"
DATASET_PATH = "data/dataset.csv"
SAMPLE_PATH = "data/sample_listings.csv"

CATEGORIES = [
    "SHOES",
    "HARDWARE",
    "MECHANICAL_COMPONENTS",
    "SOFA",
    "ELECTRONICS",
    "HOME_FURNITURE",
    "CLOTHING",
    "BEAUTY",
    "KITCHEN",
    "OFFICE_PRODUCTS",
]

MOCK_ABO_BASE = [
    {
        "item_id": "B081234567",
        "title": "AmazonBasics PETG 3D Printer Filament 1.75mm 1kg Spool",
        "brand": "AmazonBasics",
        "product_type": "MECHANICAL_COMPONENTS",
        "bullet_points": "High transparency, easy to print, chemical resistance.",
        "color": "Black",
        "material": "PETG",
        "item_dimensions": "8 x 8 x 2.8 inches",
    },
    {
        "item_id": "B079876543",
        "title": "Stone & Beam Ergonomic Leather Executive Office Chair",
        "brand": "Stone & Beam",
        "product_type": "HOME_FURNITURE",
        "bullet_points": "Padded armrests, lumbar support, 360-degree swivel.",
        "color": "Espresso Brown",
        "material": "Genuine Leather",
        "item_dimensions": "26 x 27 x 42 inches",
    },
    {
        "item_id": "B08ABCDEF1",
        "title": "find. Women's Ankle Strap Pointed Toe High Heel Pumps",
        "brand": "find.",
        "product_type": "SHOES",
        "bullet_points": "Faux suede upper, synthetic sole, 3-inch stiletto heel.",
        "color": "Red",
        "material": "Faux Suede",
        "item_dimensions": "10 x 4 x 3 inches",
    },
    {
        "item_id": "B07XYZ9876",
        "title": "AmazonBasics Heavy Duty Stainless Steel Drawer Slides 22 Inch",
        "brand": "AmazonBasics",
        "product_type": "HARDWARE",
        "bullet_points": "Ball bearing mechanism, 100lb load capacity, soft close.",
        "color": "Silver",
        "material": "Stainless Steel",
        "item_dimensions": "22 x 1.77 x 0.5 inches",
    },
    {
        "item_id": "B091122334",
        "title": "Rivet Modern Mid-Century Upholstered Armchair",
        "brand": "Rivet",
        "product_type": "SOFA",
        "bullet_points": "Solid hardwood frame, stain-resistant fabric, easy assembly.",
        "color": "Navy Blue",
        "material": "Polyester Blend",
        "item_dimensions": "32 x 34 x 35 inches",
    },
]


def extract_first_value(val):
    if isinstance(val, list) and len(val) > 0:
        if isinstance(val[0], dict) and "value" in val[0]:
            return val[0]["value"]
        return str(val[0])
    elif isinstance(val, str):
        return val
    return ""


def download_and_parse_abo(limit=4000):
    listings = []
    print(f"Attempting to download ABO listings from S3 ({S3_ABO_URL})...")
    try:
        req = urllib.request.Request(S3_ABO_URL, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=20) as resp:
            with gzip.GzipFile(fileobj=resp) as gz:
                for line in gz:
                    if len(listings) >= limit:
                        break
                    try:
                        raw = json.loads(line)
                        title = extract_first_value(raw.get("item_name"))
                        brand = extract_first_value(raw.get("brand"))
                        ptype = extract_first_value(raw.get("product_type"))
                        bullets = extract_first_value(raw.get("bullet_point"))
                        color = extract_first_value(raw.get("color"))
                        material = extract_first_value(raw.get("material"))
                        dims = str(raw.get("item_dimensions", ""))
                        item_id = raw.get("item_id", f"B00{len(listings)}")

                        if title and ptype:
                            listings.append(
                                {
                                    "item_id": item_id,
                                    "title": title,
                                    "brand": brand or "Generic",
                                    "product_type": ptype,
                                    "bullet_points": bullets or "",
                                    "color": color or "",
                                    "material": material or "",
                                    "item_dimensions": dims if dims != "None" else "",
                                }
                            )
                    except Exception:
                        continue
        print(f"Successfully loaded {len(listings)} listings from S3 ABO dataset.")
    except Exception as e:
        print(
            f"Could not fetch full ABO S3 dataset ({e}). Generating expanded ABO synthetic baseline..."
        )
        listings = []
        for i in range(limit):
            base = random.choice(MOCK_ABO_BASE)
            item = base.copy()
            item["item_id"] = f"ABO_{i:06d}"
            listings.append(item)

    return listings


def inject_defects(raw_listings):
    df_rows = []
    random.seed(42)
    np.random.seed(42)

    for item in raw_listings:
        # Create a clean record
        clean_row = item.copy()
        clean_row["defect"] = 0
        clean_row["defect_type"] = "none"
        clean_row["quality_score"] = 100.0
        df_rows.append(clean_row)

        # Create a corrupted record with injected defects
        corrupted = item.copy()
        corrupted["item_id"] = f"{item['item_id']}_DEFECT"

        defect_type = random.choice(
            ["missing_attribute", "truncated_title", "category_mismatch", "duplicate"]
        )

        quality_score = 100.0

        if defect_type == "missing_attribute":
            corrupted["brand"] = ""
            corrupted["material"] = ""
            corrupted["color"] = ""
            quality_score -= random.uniform(35.0, 50.0)

        elif defect_type == "truncated_title":
            title_words = corrupted["title"].split()
            if len(title_words) > 2:
                corrupted["title"] = " ".join(title_words[:2])
            else:
                corrupted["title"] = corrupted["title"][:8]
            quality_score -= random.uniform(30.0, 45.0)

        elif defect_type == "category_mismatch":
            current_ptype = corrupted["product_type"]
            other_cats = [c for c in CATEGORIES if c != current_ptype]
            corrupted["product_type"] = random.choice(other_cats)
            quality_score -= random.uniform(40.0, 60.0)

        elif defect_type == "duplicate":
            corrupted["title"] = f"{corrupted['title']} - {corrupted['title']}"
            corrupted["bullet_points"] = (
                f"{corrupted['bullet_points']} {corrupted['bullet_points']}"
            )
            quality_score -= random.uniform(20.0, 35.0)

        # 15% chance of secondary defect compounding
        if random.random() < 0.15:
            corrupted["brand"] = ""
            quality_score -= 20.0

        corrupted["defect"] = 1
        corrupted["defect_type"] = defect_type
        corrupted["quality_score"] = max(0.0, round(quality_score, 1))

        df_rows.append(corrupted)

    df = pd.DataFrame(df_rows)
    return df


def generate_dataset():
    raw_listings = download_and_parse_abo(limit=3000)
    df = inject_defects(raw_listings)

    # Shuffle dataframe
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)

    print(f"Generated total dataset of {len(df)} rows.")
    print("Defect breakdown:")
    print(df["defect_type"].value_counts())
    print("Quality score stats:")
    print(df["quality_score"].describe())

    df.to_csv(DATASET_PATH, index=False)
    print(f"Saved full dataset to {DATASET_PATH}")

    # Create a clean sample set of 200 rows for git tracking / testing
    sample_df = df.head(200)
    sample_df.to_csv(SAMPLE_PATH, index=False)
    print(f"Saved sample dataset (200 rows) to {SAMPLE_PATH}")


if __name__ == "__main__":
    generate_dataset()
