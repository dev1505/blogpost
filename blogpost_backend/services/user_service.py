import os
from dotenv import load_dotenv
import google.generativeai as genai
from Schema.all_schema import *

load_dotenv()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")


class UserService:

    @staticmethod
    def create_blog(blogs: Blog_Create, db, user: User_Serializer):
        user_data = db.blogsData
        created_blog = Blog_Create(**blogs.model_dump())
        created_blog.username = user.username
        user_data.insert_one(created_blog.model_dump())
        return created_blog.model_dump()

    @staticmethod
    def generate_blog(blogs: Blog_Generate, db, user: User_Serializer) -> Blog_Create:
        prompt = f"Generate a blog in markdown format such that title of the blog is {blogs.title} and related hashtags for the title are {blogs.hashtags}, don't use (markdown, ```) formatting, just give me best markdown format"
        response_from_ai = model.generate_content(prompt)
        generated_blog = Blog_Create(
            content=response_from_ai.text,
            generated_by_ai=True,
            **blogs.model_dump(),
        )
        generated_blog.username = user.username
        blogs_data = db.blogsData
        blogs_data.insert_one(generated_blog.model_dump())
        return generated_blog

    @staticmethod
    def all_blogs(db):
        user_data = db.blogsData
        cursor = user_data.find({})
        blogs = List_Blogs(data=list(cursor))
        return blogs.data

    @staticmethod
    def get_user_blogs(db, user: User_Serializer):
        blogs_data = db.blogsData
        blogs_cursor = blogs_data.find({"username": user.username})
        blogs = List_Blogs(data=list(blogs_cursor))
        return blogs.data
