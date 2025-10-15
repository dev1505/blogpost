from pymongo import MongoClient
import os
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

MONGO_URI = os.environ.get("MONGO_URI")


_client: Optional[MongoClient] = None
_db = None


def database():
    global _client, _db
    if _client is None:
        _client = MongoClient(MONGO_URI)
        # _db = _client.mydb
        _db = _client["Blogs"]
    try:
        yield _db
    finally:
        pass
