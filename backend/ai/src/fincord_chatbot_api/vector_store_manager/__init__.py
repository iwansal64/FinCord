from langchain_core.runnables.base import RunnableSerializable
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.agents.middleware.types import InputAgentState
from langchain_text_splitters import RecursiveCharacterTextSplitter

from qdrant_client.http.models import Distance, VectorParams
from qdrant_client import AsyncQdrantClient, models

import json
from os import getenv
from pydantic.json_schema import SkipJsonSchema
from uuid import uuid4

from fincord_chatbot_api.type_manager import PendingSyncTransactions

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from _typeshed import DataclassInstance

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


async def update_records_data_to_vector_store(collection_name: str, qdrant_client: SkipJsonSchema[AsyncQdrantClient], embeddings: GoogleGenerativeAIEmbeddings, user_id: int, pending_transaction: list[PendingSyncTransactions], general_agent: SkipJsonSchema[RunnableSerializable[dict[str, Any], str]]):
    """This function is used to apply pendings from database. The pending data is received through API"""
    for transaction in pending_transaction:
        # ? Delete previous data in vector store that has the same transaction id
        await qdrant_client.delete(
            collection_name=collection_name,
            points_selector=models.FilterSelector(
                filter=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="transaction_id",
                            match=models.MatchValue(value=transaction.id)
                        )
                    ]
                )
            )
        )

        # ? Use AI to generate processed content before inserted into qdrant vector store
        processed_content: str = general_agent.invoke(input={
            "message": f"Create raw data from this json: {(json.dumps(transaction.to_dict()))}"
        })
        processed_content = processed_content.strip()
        print(f"processed_content: {processed_content}")

        # ? Split the processed content 
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=100, chunk_overlap=0)
        processed_content_splitted = text_splitter.split_text(processed_content)

        for processed_content_chunk in processed_content_splitted:
            embedded_query = embeddings.embed_query(processed_content_chunk)
            print(f"length of embedded query: {len(embedded_query)}")
            await qdrant_client.upsert(
                collection_name=collection_name,
                points=[
                    models.PointStruct(
                        id=uuid4(),
                        payload={
                            "user_id": user_id,
                            "transaction_id": transaction.id,
                            "transaction_date": transaction.created_at,
                            "content": processed_content_chunk
                        },
                        vector=embedded_query
                    )
                ]
            )