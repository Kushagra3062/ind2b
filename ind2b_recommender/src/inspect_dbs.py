
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

PROD_DB = os.getenv("PROD_DB")
PROFILE_DB = os.getenv("PROFILE_DB")
MONGODB_URI = os.getenv("MONGODB_URI") # This is often PROD_DB in .env

URIS = {
    "PROD_DB": PROD_DB,
    "PROFILE_DB": PROFILE_DB,
    "MONGODB_URI": MONGODB_URI
}

def inspect_uri(name, uri):
    if not uri:
        print(f"[{name}] No URI found.")
        return

    print(f"\n--- Inspecting {name} ---")
    try:
        client = MongoClient(uri)
        dbs = client.list_database_names()
        print(f"Databases: {dbs}")
        
        for db_name in dbs:
            if db_name in ["admin", "local", "config"]:
                continue
            
            db = client[db_name]
            cols = db.list_collection_names()
            print(f"  DB '{db_name}': {cols}")
            
            if "products" in cols:
                count = db["products"].count_documents({})
                print(f"    -> 'products' count: {count}")
                if count > 0:
                    sample = db["products"].find_one()
                    print(f"    -> Sample Product: {sample.get('title', 'No Title')} (ID: {sample.get('product_id')})")

    except Exception as e:
        print(f"Error inspecting {name}: {e}")

if __name__ == "__main__":
    for name, uri in URIS.items():
        if uri:
           inspect_uri(name, uri)
