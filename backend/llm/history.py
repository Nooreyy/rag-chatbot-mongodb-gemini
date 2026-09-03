from datetime import datetime, timezone

from bson import ObjectId

from backend.database import (
    conversations_collection,
    messages_collection
)


def create_conversation(
    user_id: str,
    title: str
):
    conversation = {
        "user_id": user_id,
        "title": title,
        "created_at": datetime.now(timezone.utc)
    }

    result = conversations_collection.insert_one(
        conversation
    )

    return str(result.inserted_id)


def save_message(
    conversation_id: str,
    user_id: str,
    role: str,
    content: str
):
    message = {
        "conversation_id": conversation_id,
        "user_id": user_id,
        "role": role,
        "content": content,
        "created_at": datetime.now(timezone.utc)
    }

    messages_collection.insert_one(message)


def get_conversation_messages(
    conversation_id: str,
    user_id: str
):
    messages = messages_collection.find(
        {
            "conversation_id": conversation_id,
            "user_id": user_id
        }
    ).sort(
        "created_at",
        1
    )

    return list(messages)