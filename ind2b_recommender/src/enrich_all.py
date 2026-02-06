import csv
import shutil
import os
import sys

# Increase field size limit for base64 data
csv.field_size_limit(10**7)

# Backup
if os.path.exists("d:/ind2b_recommender/data/products.csv"):
    shutil.copy("d:/ind2b_recommender/data/products.csv", "d:/ind2b_recommender/data/products_backup.csv")

# Image Mappings
KEYWORD_IMAGES = {
    "Drill": "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500",
    "Grinder": "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=500", # General Tool
    "Printer": "https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?w=500",
    "Marker": "https://images.unsplash.com/photo-1516961642265-531546e84af2?w=500",
    "Wrench": "https://images.unsplash.com/photo-1581147036324-c17ac41d1685?w=500",
    "Saw": "https://images.unsplash.com/photo-1540104732646-7789182352f2?w=500",
    "Jigsaw": "https://images.unsplash.com/photo-1540104732646-7789182352f2?w=500",
    "Hammer": "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500",
    "Gloves": "https://images.unsplash.com/photo-1598516963428-98bb42f45cc3?w=500",
    "Bearing": "https://plus.unsplash.com/premium_photo-1678282367503-4f91d8e1329c?w=500",
    "Blower": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500",
    "Notebook": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500",
    "Pen": "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=500", # Highlighter/Pen
    "Soap": "https://images.unsplash.com/photo-1600857062241-98e5b4f91269?w=500",
}
DEFAULT_IMAGE = "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=500"

def get_image(title):
    for key, url in KEYWORD_IMAGES.items():
        if key.lower() in title.lower():
            return url
    return DEFAULT_IMAGE

rows = []
try:
    with open("d:/ind2b_recommender/data/products.csv", "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        
        for row in reader:
            current_img = row.get("image_link", "")
            
            # If image is missing, placeholder, or base64 (too long)
            if not current_img or "plus.unsplash.com/premium_photo-1721460167419" in current_img or len(current_img) > 500:
                 row["image_link"] = get_image(row["title"])
            
            # Also fix specific known bad IDs if possible, but title-image map is most critical.
            # Fix Soap ID just in case
            if "Soap" in row["title"]:
                row["product_id"] = "42" # Keep as is, just ensure image
                
            rows.append(row)

    with open("d:/ind2b_recommender/data/products.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Successfully updated {len(rows)} products.")

except Exception as e:
    print(f"Error: {e}")
