from typing import Optional, List
from datetime import datetime, timezone, date
from pydantic import BaseModel

# from bson import ObjectId


class User_Serializer(BaseModel):
    username: Optional[str] = None
    password: str
    email: str
    user_cost: float = 0.0
    registration_time: str = str(datetime.now(timezone.utc).time())


class Token_Serializer(BaseModel):
    access_token: str
    refresh_token: str


class User_In_Blogs(BaseModel):
    username: str
    email: str


class Blog_Create(BaseModel):
    title: str
    hashtags: str
    user: User_In_Blogs
    content: str
    generated_by_ai: bool = False
    post_time: str = str(datetime.now(timezone.utc).time())
    post_date: str = str(date.today())
    user_cost: float = 0.0


class Blog_Listing(Blog_Create):
    title: str
    id: str
    hashtags: str
    user: User_In_Blogs
    content: str
    generated_by_ai: bool = False
    post_time: str = str(datetime.now(timezone.utc).time())
    post_date: str = str(date.today())


class Blog_Generate(BaseModel):
    user: User_In_Blogs
    title: str
    hashtags: str


class List_Blogs(BaseModel):
    data: List[Blog_Listing]
