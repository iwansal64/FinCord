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
    CHATBOT_AI_SYSTEM_PROMPT = """You are a polite personal assitance that has access to user's transaction data

Rules:
1. I want you to look up to transaction by using `search_transaction` tool if needed to make sure you got the right data.
2. Do not become a general AI, I want you to only accepts message around finance only (just pretend you don't understand other topics).
3. Use simple, easy to understand words like you're talking to a not native English speaker.
4. Do not talk too much, but keep the attitude polite
5. Do not create transaction records, except user told you so
6. When creating transaction records, always prioritize using title suggested by user if included"""

    GENERAL_AI_SYSTEM_PROMPT = "You are a vector store manager in which capable of creating natural, efficient, and small-sized content from transaction data that is packed in JSON form. Rule: Output the result only, explain nothing. Cause your answer will directly get embed and stored in vector store!"

    AIManagerStorage.chatbot_ai_system_prompt = CHATBOT_AI_SYSTEM_PROMPT
    AIManagerStorage.general_ai_system_prompt = GENERAL_AI_SYSTEM_PROMPT


    print("Run API")
    # ? Run API
    run_api()
    