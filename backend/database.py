import os   # Operating System module import kiya taake environment variables ko access kiya ja sake
from pymongo import MongoClient # MongoDB client import kiya taake MongoDB ke sath interact kiya ja sake
from dotenv import load_dotenv  # dotenv module import kiya taake .env file se environment variables load kiye ja saken

load_dotenv()

# Get the MongoDB URI from environment variables
MONGODB_URI = os.getenv("MONGODB_URI")

# Create a MongoDB client
client = MongoClient(MONGODB_URI)

# Access the database (replace 'your_database_name' with your actual database name)
db = client["rag_chatbot"]  

users_collection = db["users"]  # Access the 'users' collection

conversations_collection = db["conversations"] # Access the 'conversations' collection

messages_collection = db["messages"] # Access the 'messages' collection


def test_connection():
    try:
        client.admin.command('ping')
        print("Connected to MongoDB successfully!")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
