from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.environ.get("MONGO_URI")

try:
    client = MongoClient(MONGO_URI)
    db = client["mydatabase"]
    print("✅ MongoDB connection successful!")
    print("Collections:", db.list_collection_names())

except Exception as e:
    print("❌ MongoDB connection failed:", e)
