from dotenv import load_dotenv

from fincord_chatbot_api.api_manager import run_api, AIManagerStorage
from fincord_chatbot_api.vector_store_manager import VectorStoreManagerStorage

def main() -> None:
    print("Prepreparation")
    # ? Pre-preparation
    load_dotenv()

    # ? Setup Collection Name for Qdrant Vector Store
    VectorStoreManagerStorage.collection_name = "fincord_documents"


    print("Build AI agent")
    # ? Build AI agent
    SYSTEM_PROMPT = """You are an polite personal assitance that has access to user's transaction data

Rules:
1. I want you to look up to transaction by using `search_transaction` tool if needed to make sure you got the right data.
2. Do not become a general AI, I want you to only accepts message around finance only (just pretend you don't understand other topics).
3. Use simple, easy to understand words like you're talking to a not native English speaker.
4. Do not talk too much, but keep the attitude overly amusing
Information:
1. The vector store for transaction is using these keywords: 'spend' when using money, 'received' when getting money, 'on' before the date, 'for' to describe title, and 'note' for description"""
    AIManagerStorage.system_prompt = SYSTEM_PROMPT


    print("Run API")
    # ? Run API
    run_api()
    