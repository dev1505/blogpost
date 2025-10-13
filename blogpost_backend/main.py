from fastapi import FastAPI
from pydantic import BaseModel
import google.generativeai as genai
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager

load_dotenv()

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

MONGO_URI = os.environ.get("MONGO_URI")
my_resources = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application starting up...")
    client = MongoClient(MONGO_URI)
    db = client["Blogs"]
    my_resources["database_connection"] = "connected_to_database"
    print("Database connection established.")
    yield
    print("Application shutting down...")
    if "database_connection" in my_resources:
        print("Closing database connection.")
        del my_resources["database_connection"]


app = FastAPI(lifespan=lifespan)


class Blog_Post_Serializer(BaseModel):
    title: str
    hashtags: str
    content: str
    post_time: str | None


@app.get("/")
def read_root():
    # prompt = "Explain quantum computing in a simple way."
    # response = model.generate_content(prompt)
    return {
        "Hello": "World",
        "data": "response.text",
    }


@app.post("/create/blog")
def create_blog(blogs: Blog_Post_Serializer):
    return blogs
