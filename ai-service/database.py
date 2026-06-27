from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")

if not MONGODB_URL:
    raise ValueError("MONGODB_URL is not set in environment variables")

client = MongoClient(MONGODB_URL)
db = client.get_database("avcode") 
vector_collection = db.get_collection("course_vectors")

def get_vector_collection():
    return vector_collection
