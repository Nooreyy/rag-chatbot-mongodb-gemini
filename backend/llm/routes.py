from fastapi import APIRouter, Depends

from backend.llm.schemas import ChatRequest
from backend.auth.dependencies import get_current_user

from backend.rag.retriever import search_similar_chunks
from backend.rag.generator import generate_rag_answer

from backend.llm.history import (create_conversation, save_message, get_conversation_messages)


router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


@router.post("/")
def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):

    user_id = current_user["user_id"]

    # Create a new conversation if needed
    conversation_id = request.conversation_id

    if conversation_id is None:
        conversation_id = create_conversation(
            user_id=user_id,
            title=request.message[:50]
        )

    # Save user's question
    save_message(
        conversation_id=conversation_id,
        user_id=user_id,
        role="user",
        content=request.message
    )

    # RAG retrieval
    retrieved_chunks = search_similar_chunks(
        request.message,
        limit=3
    )

    # Generate RAG answer
    answer = generate_rag_answer(
        request.message,
        retrieved_chunks
    )

    # Save assistant answer
    save_message(
        conversation_id=conversation_id,
        user_id=user_id,
        role="assistant",
        content=answer
    )

    return {
        "conversation_id": conversation_id,
        "message": request.message,
        "answer": answer
    }

@router.get("/{conversation_id}")
def get_chat_history(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):

    user_id = current_user["user_id"]

    messages = get_conversation_messages(
        conversation_id,
        user_id
    )

    history = []

    for message in messages:
        history.append({
            "role": message["role"],
            "content": message["content"],
            "created_at": message["created_at"]
        })

    return {
        "conversation_id": conversation_id,
        "messages": history
    }