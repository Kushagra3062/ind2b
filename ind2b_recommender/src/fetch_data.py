from pymongo import MongoClient
import os
from dotenv import load_dotenv
import pandas as pd

load_dotenv()

uri = os.getenv("MONGODB_URI")
db_name = os.getenv("PROD_DB", "test")
product_collection = os.getenv("PRODUCT_COLLECTION", "products")
event_collection = os.getenv("EVENT_COLLECTION", "orders")

client = MongoClient(uri)
db = client[db_name]

print(f"📦 Using database: {db_name}")

# Fetch products
products = list(db[product_collection].find({}, {"_id": 0}))
products_df = pd.DataFrame(products)
print(f"✔ {len(products_df)} products loaded")

# Fetch orders
orders = list(db[event_collection].find({}, {"_id": 0}))
orders_df = pd.DataFrame(orders)
print(f"✔ {len(orders_df)} orders loaded")

# Convert orders to user-product interactions
interaction_rows = []

# Build seller → product list mapping
seller_products = (
    products_df.groupby("seller_id")["product_id"]
    .apply(list)
    .to_dict()
)

for _, row in orders_df.iterrows():
    buyer = row.get("buyer_id")
    seller = row.get("seller_id")

    # If seller has products, assign them to this buyer
    product_ids = seller_products.get(seller, [])

    for pid in product_ids:
        interaction_rows.append([buyer, pid, "purchase", 5])

interactions_df = pd.DataFrame(interaction_rows,
                               columns=["user_id", "product_id", "event_type", "weight"])

print(f"✔ {len(interactions_df)} user-product interactions created")

# Create data folder if missing
os.makedirs("../data", exist_ok=True)

products_df.to_csv("../data/products.csv", index=False)
interactions_df.to_csv("../data/interactions.csv", index=False)

print("\n🎯 EXPORT COMPLETE!")
print(f"📁 products.csv = {len(products_df)} rows")
print(f"📁 interactions.csv = {len(interactions_df)} rows")
