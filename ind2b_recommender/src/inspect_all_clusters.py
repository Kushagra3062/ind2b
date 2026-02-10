
import os
import io
import sys
from pymongo import MongoClient

# Use UTF-8 for stdout/stderr
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Extracted from PortalWeb/.env.local
URIS = {
    "CLUSTER_PFNFQ (MONGODB_URI)": "mongodb+srv://Productcirc:Ranjesh9525@cluster0.pfnfq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    "CLUSTER_ZWHN7 (PROD_DB)": "mongodb+srv://devloper:developer@cluster0.zwhn7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    "CLUSTER_C0JFV (PROFILE_DB)": "mongodb+srv://productcirc:Ranjesh12345@cluster0.c0jfv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
}

def inspect():
    with open("inspection_log.txt", "w", encoding="utf-8") as log:
        for name, uri in URIS.items():
            msg_header = f"\n==================================================\nCONNECTING TO: {name}\nURI: {uri.split('@')[1]}\n==================================================\n"
            print(msg_header)
            log.write(msg_header)
            
            try:
                client = MongoClient(uri, serverSelectionTimeoutMS=5000)
                # Force connection verification
                client.admin.command('ping')
                success_msg = "✅ Connection Successful!\n"
                print(success_msg)
                log.write(success_msg)
                
                dbs = client.list_database_names()
                log.write(f"Databases: {dbs}\n")
                
                for db_name in dbs:
                    if db_name in ['admin', 'local', 'config']:
                        continue
                    
                    db = client[db_name]
                    cols = db.list_collection_names()
                    col_msg = f"  📂 DB [{db_name}] Collections: {cols}\n"
                    log.write(col_msg)
                    print(col_msg.strip())
                    
                    # Check for products
                    for col_name in cols:
                        if 'product' in col_name.lower():
                            count = db[col_name].count_documents({})
                            count_msg = f"     👉 Found '{col_name}' with {count} documents.\n"
                            log.write(count_msg)
                            print(count_msg.strip())
                            
                            if count > 0:
                                sample = db[col_name].find_one()
                                sample_msg = f"        Sample Key: {list(sample.keys())[:5]}\n        Sample Title: {sample.get('title') or sample.get('name')}\n"
                                log.write(sample_msg)
                                print(sample_msg.strip())

            except Exception as e:
                err_msg = f"❌ Connection Failed: {e}\n"
                print(err_msg)
                log.write(err_msg)

if __name__ == "__main__":
    inspect()
