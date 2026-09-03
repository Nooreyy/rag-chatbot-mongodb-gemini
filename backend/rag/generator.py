from backend.llm.service import generate_response


def generate_rag_answer(
    question: str,
    retrieved_chunks: list
):
    # Combine retrieved chunks into one context
    context = "\n\n".join(
        chunk["text"]
        for chunk in retrieved_chunks
    )

    prompt = f"""
You are a helpful AI assistant.

Answer the user's question using ONLY the
information provided in the context below.

If the answer is not present in the context,
say that you do not have enough information.

Context:
{context}

User Question:
{question}

Answer:
"""

    answer = generate_response(prompt)

    return answer

from backend.rag.retriever import search_similar_chunks


# if __name__ == "__main__":

#     question = "What is Retrieval-Augmented Generation?"

#     chunks = search_similar_chunks(
#         question,
#         limit=3
#     )

#     answer = generate_rag_answer(
#         question,
#         chunks
#     )

#     print("\nFINAL ANSWER:")
#     print(answer)