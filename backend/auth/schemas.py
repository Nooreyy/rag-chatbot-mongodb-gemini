# Pydantic se BaseModel import kar rahe hain
# BaseModel ki help se hum request data ka structure define karte hain

from pydantic import BaseModel, EmailStr

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str