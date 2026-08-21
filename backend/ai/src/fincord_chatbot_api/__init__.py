from dotenv import load_dotenv
from qdrant_client import AsyncQdrantClient

from fincord_chatbot_api.ai_manager import get_time, search_transactions, build_default_agent
from fincord_chatbot_api.api_manager import run_api
from fincord_chatbot_api.vector_store_manager import VectorStoreManagerStorage
from fincord_chatbot_api.type_manager import AgentContextSchema

def main() -> None:
    print("Prepreparation")
    # ? Pre-preparation
    load_dotenv()

    # ? Setup Collection Name for Qdrant Vector Store
    VectorStoreManagerStorage.collection_name = "fincord_documents"


    print("Build AI agent")
    # ? Build AI agent
    SYSTEM_PROMPT = """You are an over-polite, yet shy personal assitance that has access to user's data

Rules:
1. I want you to look up to transaction by using `search_transaction` tool if needed to make sure you got the right data.
Information:
1. The vector store for transaction is using keywords; 'spend' when using money, 'received' when getting money, 'on' before the date, 'for' to describe title, and 'note' for description"""
    agent = build_default_agent(
        context_schema=AgentContextSchema,
        tools=[get_time, search_transactions],
        system_prompt=SYSTEM_PROMPT
    )


    print("Run API")
    # ? Run API
    run_api(
        agent=agent
    )
    