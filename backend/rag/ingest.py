from pathlib import Path

from backend.database import db
from backend.rag.embeddings import generate_embedding
from backend.rag.splitter import split_text


documents_collection = db["documents"]


def ingest_document(file_path: str):

    path = Path(file_path)

    text = path.read_text(
        encoding="utf-8"
    )

    chunks = split_text(text)

    documents = []

    for chunk in chunks:

        embedding = generate_embedding(chunk)

        documents.append({
            "text": chunk,
            "embedding": embedding,
            "source": path.name
        })

    if documents:

        documents_collection.insert_many(
            documents
        )

    print(
        f"Inserted {len(documents)} chunks."
    )


if __name__ == "__main__":

    ingest_document("D:\\1- Noor\\2-SMIT\\7-AI and Data Science\\rag-chatbot\\data\\knowledge.txt")