from fastapi import FastAPI, Depends, Response, Request, APIRouter
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from services.auth_service import *
from Schema.all_schema import *
from services.user_service import *
from dependencies import *
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()


MONGO_URI = os.environ.get("MONGO_URI")
ALGORITHM = os.environ.get("ALGORITHM")
ACCESS_TOKEN_EXPIRE_HOURS = int(os.environ.get("ACCESS_TOKEN_EXPIRE_HOURS"))
SECRET_KEY = os.environ.get("SECRET_KEY")
REFRESH_TOKEN_EXPIRE_DAYS = int(os.environ.get("REFRESH_TOKEN_EXPIRE_DAYS"))

my_resources = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application starting up...")
    database()
    my_resources["database_connection"] = "connected_to_database"
    print("Database connection established.")
    yield
    print("Application shutting down...")
    if "database_connection" in my_resources:
        print("Closing database connection.")
        del my_resources["database_connection"]


app = FastAPI(lifespan=lifespan)
router = APIRouter()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://effective-couscous-q59v65p6wgq2rj9-8001.app.github.dev",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@router.post("/login")
def login(user: User_Serializer, db=Depends(database)):
    return AuthService.login_service(user, db)


@router.post("/register")
def register(user: User_Serializer, db=Depends(database)):
    return AuthService.signup_service(user, db)


@router.get("/logout")
def logout(request: Request, response: Response):
    return AuthService.logout_service(request=request, response=response)


@router.get("/refresh", response_model=Token_Serializer)
def refresh(request: Request, db=Depends(database)):
    return AuthService.refresh_token_service(db=db, request=request)


@router.post("/create/blog", response_model=Blog_Create)
def create_blog(
    blogs: Blog_Create, db=Depends(database), user=Depends(AuthService.verify_user)
):
    return UserService.create_blog(blogs=blogs, db=db, user=user)


@router.post("/edit/blog", response_model=Blog_Create)
def create_blog(
    blogs: Blog_Listing, db=Depends(database), user=Depends(AuthService.verify_user)
):
    return UserService.edit_blog(blogs=blogs, db=db, user=user)


@router.post("/generate/blog", response_model=Blog_Create)
def generate_blog(
    blogs: Blog_Generate, db=Depends(database), user=Depends(AuthService.verify_user)
):
    return UserService.generate_blog(blogs=blogs, db=db, user=user)


@router.get("/get/all/blogs")
def get_blogs(db=Depends(database)):
    return UserService.all_blogs(db=db)


@router.get("/get/blog/{id}")
def get_blog_by_id(id: str, db=Depends(database)):
    return UserService.get_blog_by_id(id=id, db=db)


@router.get("/get/user/blogs")
def get_blogs(db=Depends(database), user=Depends(AuthService.verify_user)):
    return UserService.get_user_blogs(db=db, user=user)


@router.get("/get/user")
def get_blogs(user=Depends(AuthService.verify_user)):
    return {
        "data": user,
        "success": True,
    }


app.include_router(router, prefix="/api")
