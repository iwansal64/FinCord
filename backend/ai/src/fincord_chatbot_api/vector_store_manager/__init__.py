from langchain_google_genai import GoogleGenerativeAIEmbeddings

from qdrant_client.http.models import Distance, VectorParams
from qdrant_client import AsyncQdrantClient, models

from os import getenv
from pydantic.json_schema import SkipJsonSchema

from fincord_chatbot_api.type_manager import PendingSyncTransactions

# ? Static Variables
class VectorStoreManagerStorage:
    collection_name: str = ""
    embeddings: GoogleGenerativeAIEmbeddings


async def create_default_qdrant_client(collection_name: str) -> SkipJsonSchema[AsyncQdrantClient]:
    VectorStoreManagerStorage.collection_name = collection_name
    
    print("Create Qdrant client")
    # ? Create Qdrant client
    client = AsyncQdrantClient(
        url=getenv("QDRANT_URL", "http://localhost:6333"),
    )


    print("Create embeddings")
    # ? Create embeddings
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001"
    )
    VectorStoreManagerStorage.embeddings = embeddings


    print("Create or check on selected collection")
    # ? Create or check on selected collection
    vector_size = len(embeddings.embed_query("probe")) 
    if not (await client.collection_exists(collection_name)):
        await client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
        )

    print("Return the QdrantVectorStore")
    # ? Return the QdrantVectorStore
    # Create vector store for specific collection with google embeddings
    return client


async def update_records_data_to_vector_store(collection_name: str, qdrant_client: SkipJsonSchema[AsyncQdrantClient], embeddings: GoogleGenerativeAIEmbeddings, user_id: int, pending_transaction: list[PendingSyncTransactions]):
    """This function is used to apply pendings from database. The pending data is received through API"""
    for transaction in pending_transaction:
        if transaction.is_deleted or transaction.amount == None:
            # ? Delete data in vector store
            await qdrant_client.delete(
                collection_name=collection_name,
                points_selector=models.PointIdsList(
                    points=[transaction.id]
                )
            )
            continue

        # ? Update or Insert data to vector store
        processed_content = (
            f"{f'received {transaction.amount}$' if transaction.amount > 0 else f'spend {-transaction.amount}$'} for {transaction.title} on {transaction.created_at}."
            f"note:{transaction.description or '-'}."
        )

        # ? Create text splitter to be used for chunking text
        await qdrant_client.upsert(
            collection_name=collection_name,
            points=[
                models.PointStruct(
                    id=transaction.id,
                    payload={
                        "user_id": user_id,
                        "transaction_id": transaction.id,
                        "transaction_date": transaction.created_at,
                        "content": processed_content
                    },
                    vector=embeddings.embed_query(processed_content)
                )
            ]
        )