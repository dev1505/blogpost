from fastapi import FastAPI, Depends, HTTPException, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import google.generativeai as genai
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from datetime import datetime, timezone, date, timedelta
from typing import Optional, List
from passlib.context import CryptContext
from jose import jwt, JWTError

load_dotenv()

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

MONGO_URI = os.environ.get("MONGO_URI")
ALGORITHM = os.environ.get("ALGORITHM")
ACCESS_TOKEN_EXPIRE_HOURS = int(os.environ.get("ACCESS_TOKEN_EXPIRE_HOURS"))
SECRET_KEY = os.environ.get("SECRET_KEY")
REFRESH_TOKEN_EXPIRE_DAYS = int(os.environ.get("REFRESH_TOKEN_EXPIRE_DAYS"))

my_resources = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application starting up...")
    client = MongoClient(MONGO_URI)
    db = client["Blogs"]
    app.state.db = db
    my_resources["database_connection"] = "connected_to_database"
    print("Database connection established.")
    yield
    print("Application shutting down...")
    if "database_connection" in my_resources:
        print("Closing database connection.")
        del my_resources["database_connection"]


app = FastAPI(lifespan=lifespan)


def database():
    return app.state.db


@app.get("/")
def read_root():
    # prompt = "Explain quantum computing in a simple way."
    # response = model.generate_content(prompt)
    return {
        "Hello": "World",
        "data": "response.text",
    }


class User_Serializer(BaseModel):
    username: str
    password: str
    email: str
    registration_time: Optional[str] = str(datetime.now(timezone.utc).time())


class Token_Serializer(BaseModel):
    access_token: str
    refresh_token: str


pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.today() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.today() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@app.post("/login", response_model=Token_Serializer)
def login(response: Response, user: User_Serializer, db=Depends(database)):
    userData = db.userData
    existing_user: User_Serializer = userData.find_one({"email": user.email})
    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid User",
        )

    if not verify_password(user.password, existing_user["password"]):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    access_token = create_access_token({"sub": user.email})
    refresh_token = create_refresh_token({"sub": user.email})

    response = JSONResponse(
        {
            "access_token": access_token,
            "refresh_token": refresh_token,
        }
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_HOURS * 60,
        path="/",
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/",
    )

    return response


@app.post("/register")
def register(user: User_Serializer, db=Depends(database)):
    userData = db.userData
    existing_user = userData.find_one({"email": user.email})
    print(existing_user)
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User already exists",
        )

    hashed_pw = hash_password(user.password)
    user_dict = user.model_dump()
    user_dict["password"] = hashed_pw

    userData.insert_one(user_dict)
    login(user=user)


@app.post("/refresh", response_model=Token_Serializer)
def refresh(refresh_token: str, db=Depends(database)):
    userData = db.userData
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=401,
                detail="Invalid token type",
            )
        user_from_token: User_Serializer = payload.get("sub")
        user = userData.find_one({"email": user_from_token.email})

        if not user:
            raise HTTPException(
                status_code=401,
                detail="User not found",
            )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token",
        )

    access = create_access_token({"sub": user_from_token.email})
    refresh = create_refresh_token({"sub": user_from_token.email})

    return {
        "access_token": access,
        "refresh_token": refresh,
        "success": True,
    }


class Blog_Create(BaseModel):
    title: str
    hashtags: str
    content: str
    generated_by_ai: bool
    post_time: Optional[str] = str(datetime.now(timezone.utc).time())
    post_date: Optional[str] = str(date.today())


@app.post("/create/blog")
def create_blog(blogs: Blog_Create, db=Depends(database)):
    user_data = db.blogsData
    user_data.insert_one(blogs.model_dump())
    return blogs


class List_Blogs(BaseModel):
    data: List[Blog_Create]


@app.get("/get/all/blogs")
def get_blogs(db=Depends(database)):
    user_data = db.blogsData
    cursor = user_data.find({})
    blogs = List_Blogs(data=list(cursor))
    return blogs.data
