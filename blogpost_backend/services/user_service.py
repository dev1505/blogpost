import os
from dotenv import load_dotenv
import google.generativeai as genai
from Schema.all_schema import *
from bson import ObjectId

load_dotenv()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")


class UserService:

    @staticmethod
    def create_blog(blogs: Blog_Create, db, user: User_Serializer):
        blogs_data = db.blogsData
        created_blog = Blog_Create(**blogs.model_dump())
        created_blog.user = user
        blogs_data.insert_one(created_blog.model_dump())
        return created_blog.model_dump()

    @staticmethod
    def edit_blog(blogs: Blog_Listing, db, user: User_Serializer):
        blogs_data = db.blogsData
        edited_blog = Blog_Listing(**blogs.model_dump())
        edited_blog.user = user
        blogs_data.update_one(
            {"_id": ObjectId(edited_blog.id)}, {"$set": edited_blog.model_dump()}
        )
        return edited_blog.model_dump()

    @staticmethod
    def generate_blog(blogs: Blog_Generate, db, user: User_Serializer) -> Blog_Create:
        prompt = f"Generate a blog in markdown format such that title of the blog is {blogs.title} and related hashtags for the title are {blogs.hashtags}, don't use (markdown, ```) formatting, just give me best markdown format and also inlcude image links in it, give long content and also give emojis and symbols to make it interactive."
        response_from_ai = model.generate_content(prompt)
        user_cost = (
            response_from_ai.usage_metadata.prompt_token_count * 0.3 / 1000000
            + response_from_ai.usage_metadata.candidates_token_count * 3 / 1000000
        )
        generated_blog = Blog_Create(
            content=response_from_ai.text,
            generated_by_ai=True,
            user_cost=user_cost,
            **blogs.model_dump(),
        )
        generated_blog.user = user
        user_data = db.userData
        user_data.update_one(
            {"email": generated_blog.user.email}, {"$inc": {"user_cost": user_cost}}
        )
        return generated_blog

    @staticmethod
    def get_blog_by_id(id: str, db):
        blog_data = db.blogsData
        blog_cursor = blog_data.find_one({"_id": ObjectId(id)})
        blog_cursor["id"] = str(blog_cursor["_id"])
        blog = Blog_Listing(**blog_cursor)
        return blog.model_dump()

    @staticmethod
    def delete_blog_by_id(id: str, db, user: User_Serializer):
        blog_data = db.blogsData
        blog_cursor = blog_data.find_one({"_id": ObjectId(id)})
        if not blog_cursor:
            return {
                "data": "blog not found",
                "success": False,
            }
        else:
            deleted_blog = blog_data.delete_one({"_id": ObjectId(id)})
            if deleted_blog.deleted_count == 1:
                return {
                    "data": "blog deleted",
                    "success": True,
                }
            else:
                return {
                    "data": "blog not deleted",
                    "success": False,
                }

    @staticmethod
    def all_blogs(db):
        blog_data = db.blogsData
        cursor = blog_data.find({})
        blogs = List_Blogs(data=[{**doc, "id": str(doc["_id"])} for doc in cursor])
        return blogs.model_dump()["data"]

    @staticmethod
    def get_user_blogs(db, user: User_Serializer):
        blogs_data = db.blogsData
        print(user)
        blogs_cursor = blogs_data.find({"user.username": user.username})
        blogs = List_Blogs(
            data=[{**doc, "id": str(doc["_id"])} for doc in blogs_cursor]
        )
        return blogs.model_dump()["data"]
