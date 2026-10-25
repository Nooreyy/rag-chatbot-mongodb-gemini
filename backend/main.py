from fastapi import FastAPI, Depends    # FastAPI se FastAPI app banane wali class aur Depends dependency/injection helper import kiya
from fastapi.middleware.cors import CORSMiddleware  # CORS middleware import kiya taake frontend aur backend ke darmiyan requests allow ki ja saken

from backend.database import test_connection    # database.py se MongoDB connection test karne wala function import kiya   
from backend.auth.routes import router as auth_router # Authentication wali routes ko auth_router ke naam se import kiya
from backend.auth.dependencies import get_current_user # JWT token verify karke current user ki information dene wala function import kiya
from backend.llm.routes import router as chat_router # Chatbot/LLM ki routes ko chat_router ke naam se import kiya


# FastAPI ki main application create ki
app = FastAPI(
    title="RAG Chatbot API",
    version="1.0.0",
    description="API for the RAG Chatbot application"
)


# Frontend ko hamare backend se request karne ki permission do.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True, # Credentials ke sath requests allow ki
    allow_methods=["*"], # GET, POST etc. tamam HTTP methods allow kiye
    allow_headers=["*"], # Request ke tamam headers allow kiye, including Authorization header
)


test_connection()  # Test the database connection when the app starts

app.include_router(auth_router)  # Include the authentication routes
app.include_router(chat_router)  # Include the chat routes


@app.get("/") # Jab "/" URL par GET request aaye to home function run hoga
def home():
    return {"message": "Welcome to the RAG Chatbot API!"}

@app.get("/protected")
def protected_route(
    current_user: dict = Depends(get_current_user)
    # Endpoint access karne se pehle JWT verify karne ke liye get_current_user function run hoga
):

    return {
        "message": "You have access to protected data!",
        "user": current_user
    }