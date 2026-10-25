# Password ko hash or verify krna hai
# JWT access token create or verify krna hai

import os

from passlib.context import CryptContext    # Use for password hashing
from jose import jwt
from dotenv import load_dotenv

load_dotenv()


# Password Hashing

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)



# JWT Configuration

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")


def create_access_token(data: dict) -> str:
    token = jwt.encode(
        data,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )

    return token

def verify_access_token(token: str):
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )

        return payload

    except Exception:
        return None