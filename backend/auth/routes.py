from fastapi import APIRouter
from backend.database import users_collection
from backend.auth.schemas import RegisterRequest, LoginRequest
from backend.auth.security import (hash_password, verify_password, create_access_token)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# Register
@router.post("/register")
def register(user: RegisterRequest):
    # Check if the user already exists
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        return {"error": "User already exists"}

    # Hash the password before storing it
    hashed_password = hash_password(user.password)

    # Create a new user document
    new_user = {
        "email": user.email,
        "password": hashed_password,
        "full_name": user.full_name
    }

    # Insert the new user into the database
    users_collection.insert_one(new_user)

    return {"message": "User registered successfully"}

# Login
@router.post("/login")
def login(user: LoginRequest):
    # Find the user by email
    existing_user = users_collection.find_one({"email": user.email})
    if not existing_user:
        return {"error": "Invalid email or password"}

    # Verify the password
    password_correct = verify_password(user.password, existing_user["password"])
    if not password_correct:
        return {"error": "Invalid email or password"}

    # Create an access token
    access_token = create_access_token({"user_id": str(existing_user["_id"]), "email": existing_user["email"]})

    return {
        "message": "Login successful",
        "access_token": access_token, 
        "token_type": "bearer"
        }