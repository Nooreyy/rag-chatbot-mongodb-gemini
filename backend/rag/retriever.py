from backend.database import db
from backend.rag.embeddings import generate_embedding


documents_collection = db["documents"]


def search_similar_chunks(
    query: str,
    limit: int = 3
):
    # Step 1: Generate embedding for user's question
    query_embedding = generate_embedding(query)

    # Step 2: MongoDB Vector Search pipeline
    pipeline = [
        {
            "$vectorSearch": {
                "index": "vector_index",
                "path": "embedding",
                "queryVector": query_embedding,
                "numCandidates": 20,
                "limit": limit
            }
        },
        {
            "$project": {
                "_id": 0,
                "text": 1,
                "source": 1,
                "score": {
                    "$meta": "vectorSearchScore"
                }
            }
        }
    ]

    # Step 3: Execute search
    results = documents_collection.aggregate(pipeline)

    return list(results)


if __name__ == "__main__":

    question = "What is Retrieval-Augmented Generation?"

    results = search_similar_chunks(question)

    for result in results:
        print("\n--------------------")
        print("Score:", result["score"])
        print("Source:", result["source"])
        print("Text:", result["text"])