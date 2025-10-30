from jose import jwt, JWTError
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from Schema.all_schema import *
from fastapi import Depends, HTTPException, Response, Request, status
from fastapi.responses import JSONResponse
from dependencies import *

load_dotenv()


MONGO_URI = os.environ.get("MONGO_URI")
ALGORITHM = os.environ.get("ALGORITHM")
ACCESS_TOKEN_EXPIRE_HOURS = int(os.environ.get("ACCESS_TOKEN_EXPIRE_HOURS"))
SECRET_KEY = os.environ.get("SECRET_KEY")
REFRESH_TOKEN_EXPIRE_DAYS = int(os.environ.get("REFRESH_TOKEN_EXPIRE_DAYS"))

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def create_access_token(data: dict):
        to_encode = data.copy()
        expire = datetime.today() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
        to_encode.update({"exp": expire, "type": "access"})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def create_refresh_token(data: dict):
        to_encode = data.copy()
        expire = datetime.today() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh"})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def verify_token(token: str):
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email = payload.get("sub")
            if email is None:
                return None
            return email
        except JWTError:
            return None

    @staticmethod
    def set_cookie_response(access_token, refresh_token):
        response = JSONResponse(
            {
                "message": "Successfully logged in",
                "success": True,
            }
        )

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=ACCESS_TOKEN_EXPIRE_HOURS * 60 * 60,
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

    @staticmethod
    def refresh_token_service(request: Request, db):
        refresh_token = request.cookies.get("refresh_token")
        userData = db.userData
        if not refresh_token:
            return {
                "message": "Refresh token not found",
                "success": False,
            }
        try:
            payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
            if payload.get("type") != "refresh":
                raise HTTPException(
                    status_code=401,
                    detail="Invalid token type",
                )
            email: User_Serializer = payload.get("sub")
            user = userData.find_one({"email": email})

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

        access_token = AuthService.create_access_token({"sub": email})
        refresh_token = AuthService.create_refresh_token({"sub": email})

        return AuthService.set_cookie_response(
            access_token=access_token, refresh_token=refresh_token
        )

    @staticmethod
    def login_service(user, db):
        userData = db.userData
        existing_user: User_Serializer = userData.find_one({"email": user.email})
        print(existing_user)
        if not existing_user:
            raise HTTPException(
                status_code=401,
                detail="Invalid User",
            )

        existing_user = User_Serializer(**existing_user)
        if not AuthService.verify_password(user.password, existing_user.password):
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials",
            )

        access_token = AuthService.create_access_token({"sub": user.email})
        refresh_token = AuthService.create_refresh_token({"sub": user.email})

        return AuthService.set_cookie_response(
            access_token=access_token, refresh_token=refresh_token
        )

    @staticmethod
    def signup_service(user: User_Serializer, db):
        userData = db.userData
        existing_user = userData.find_one(
            {"$or": [{"email": user.email}, {"username": user.username}]}
        )
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="User already exists",
            )
        hashed_pw = AuthService.hash_password(user.password)
        user_dict = user.model_dump()
        user_dict["password"] = hashed_pw

        userData.insert_one(user_dict)
        return AuthService.login_service(user, db)

    @staticmethod
    def logout_service(request: Request, response: Response):
        token = request.cookies.get("access_token")
        if token:
            response.delete_cookie(key="access_token", path="/")
            response.delete_cookie(key="refresh_token", path="/")
            return {
                "message": "User Logout Successfull",
                "success": True,
            }
        else:
            return {
                "message": "User already logged out",
                "success": True,
            }

    @staticmethod
    def verify_user(request: Request, db=Depends(database)):
        token = request.cookies.get("access_token")
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Access token missing",
            )

        email = AuthService.verify_token(token)
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )

        user = db.userData.find_one({"email": email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        user["_id"] = str(user["_id"])
        user = User_Serializer(**user)
        return user
