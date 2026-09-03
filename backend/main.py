from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from backend.database import test_connection
from backend.auth.routes import router as auth_router
from backend.auth.dependencies import get_current_user
from backend.llm.routes import router as chat_router


app = FastAPI(
    title="RAG Chatbot API",
    version="1.0.0",
    description="API for the RAG Chatbot application"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


test_connection()  # Test the database connection when the app starts

app.include_router(auth_router)  # Include the authentication routes
app.include_router(chat_router)  # Include the chat routes


@app.get("/")
def home():
    return {"message": "Welcome to the RAG Chatbot API!"}

@app.get("/protected")
def protected_route(
    current_user: dict = Depends(get_current_user)
):

    return {
        "message": "You have access to protected data!",
        "user": current_user
    }