from pymongo import MongoClient
import os
from dotenv import load_dotenv
import pprint

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("PROD_DB")]

order = db[os.getenv("EVENT_COLLECTION")].find_one()
pprint.pprint(order)
