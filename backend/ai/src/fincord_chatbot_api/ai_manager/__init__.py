from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool, BaseTool
from langchain_core.runnables.base import RunnableSerializable
from langchain_core.output_parsers import StrOutputParser
from langchain.tools import ToolRuntime
from langchain.agents import create_agent
from langchain.agents.middleware.types import AgentState, InputAgentState, OutputAgentState
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph.state import CompiledStateGraph
from google.genai.types import AutomaticFunctionCallingConfig

from qdrant_client import models
from qdrant_client.conversions.common_types import QueryResponse

import httpx
import asyncio
from typing import Any, TYPE_CHECKING
from collections.abc import AsyncIterator
from datetime import datetime
from uuid import UUID
from os import getenv

from fincord_chatbot_api.vector_store_manager import VectorStoreManagerStorage
from fincord_chatbot_api.type_manager import AgentContextSchema, JobResult

if TYPE_CHECKING:
    from _typeshed import DataclassInstance

# ? Static Variables
class AIManagerStorage:
    chatbot_ai_system_prompt: str = ""      
    general_ai_system_prompt: str = ""


# ? AI tools
@tool
def get_time() -> str:
    """Returns current date in ISO 8601 format"""
    print("Get Date!")
    return datetime.now().astimezone().isoformat()


@tool
async def search_transactions(runtime: ToolRuntime[AgentContextSchema], query: str, date_start_iso_8601: str, date_end_iso_8601: str) -> str:
    """Search transaction records by keywords (query) using vector similarity search. date_start_iso_8601 and date_end_iso_8601 use iso8061 format. This function can only produce maximum 30 documents"""
    date_start = datetime.fromisoformat(date_start_iso_8601)
    date_end = datetime.fromisoformat(date_end_iso_8601)
    
    # ? Get the records we actually wanted by using vector cosine similarity search
    print("Search Transaction!")
    qdrant_client = runtime.context.qdrant_client
    print(f"Create embeddings from this query: {query}!")
    embedded_query = VectorStoreManagerStorage.embeddings.embed_query(query)
    print("Query Points using Qdrant Client!")
    resulted_documents: QueryResponse = await qdrant_client.query_points(
        collection_name=VectorStoreManagerStorage.collection_name,
        query=embedded_query,
        query_filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="user_id",
                    match=models.MatchValue(value=runtime.context.user_id)
                ),
                models.FieldCondition(
                    key="transaction_date",
                    range=models.DatetimeRange(
                        gte=date_start,
                        lte=date_end 
                    )
                )
            ]
        ),
        limit=30,
        with_payload=True
    )
    print("Query done!")

    return "\n\n".join([document.payload['content'] for document in resulted_documents.points if document.payload])


@tool
async def create_transactions(runtime: ToolRuntime[AgentContextSchema], title: str, description: str, amount: int) -> str | None:
    """This function is used to create transaction's record. Returns a string if there's error containing error message, returns None if there's no error"""
    try:
        # ? Get user id
        user_id = runtime.context.user_id

        # ? Send request to the main server
        rust_server_url = getenv("RUST_SERVER_BASE_URL")
        key_access_token = getenv("KEY_ACCESS")

        httpx_client = runtime.context.httpx_client
        response = await httpx_client.post(
            url=f"{rust_server_url}/ai/records",
            json={
                "user_id": user_id,
                "title": title,
                "description": description,
                "amount": amount,
            },
            headers={"Authorization": f"Bearer {key_access_token}"},
            timeout=10.0,
        )

        response.raise_for_status()

        # ? Send data to server with access key
    except Exception as e:
        return str(e)


# ? Utility functions
def send_message_to_ai(context_schema: DataclassInstance,agent: CompiledStateGraph[AgentState[Any], DataclassInstance, InputAgentState, OutputAgentState[Any]], message: str) -> AsyncIterator[dict[str, Any] | Any]:
    return agent.astream(
        input={
            "messages": [
                {
                    "role": "user",
                    "content": message
                }
            ]
        },
        context=context_schema,
        stream_mode=["updates", "messages"],
        version="v2"
    )

def append_steps_if_exists(probable_dict: dict[UUID, JobResult] | None, key: UUID, step: dict):
    if probable_dict == None:
        return
    
    probable_dict[key].steps.append(step)

def set_key_if_exists(probable_dict: dict[UUID, JobResult] | None, key: UUID, subkey: str, value: str):
    if probable_dict == None:
        return
    
    probable_dict[key].__setattr__(subkey, value)
      


async def read_ai_stream(response: AsyncIterator[dict[str, Any] | Any], job_id: UUID, job_ids: dict[UUID, JobResult] | None = None, return_async: bool = True):
    async for chunk in response:
        if chunk["type"] != "updates":
            continue

        for node, data in chunk["data"].items():
                if "messages" not in data:
                        continue

                for message in data["messages"]:
                        print("MESSAGE IN")
                        if isinstance(message, str) or not getattr(message, "content"):
                                continue

                        if node == "model":
                                if getattr(message, "content"):
                                        contents = getattr(message, "content", {})
                                        for content in contents:
                                                if "type" not in content:
                                                        append_steps_if_exists(job_ids, job_id, {"type": "unknown", "content": content})
                                                        continue

                                                content_type = content.get("type", "")
                                                if content_type == "thinking" and "thinking" in content:
                                                        append_steps_if_exists(job_ids, job_id, {"type": "thinking", "content": content["thinking"]})
                                                elif content_type == "text" and "text" in content:
                                                        set_key_if_exists(job_ids, job_id, "status", "finished")
                                                        set_key_if_exists(job_ids, job_id, "message", content["text"])


                                if getattr(message, "tool_calls"):
                                        for call in getattr(message, "tool_calls", []):
                                                append_steps_if_exists(job_ids, job_id, {"type": "tool_call", "tool": call["name"], "args": call["args"]})

                                        
                        elif node == "tools":
                                append_steps_if_exists(job_ids, job_id, {"type": "tool_result", "tool": getattr(message, "name", None), "content": getattr(message, "content", None)})


def build_default_agent(context_schema: type[DataclassInstance] | None = None, tools: list[BaseTool] = [], system_prompt: str = "", model: str = "google_genai:gemma-4-31b-it") -> CompiledStateGraph[AgentState[Any], DataclassInstance, InputAgentState, OutputAgentState[Any]]:
    agent = create_agent(
        model=model,
        tools=tools,
        system_prompt=system_prompt,
        context_schema=context_schema,
        state_schema=AgentState
    )
    return agent

def build_simplest_agent(system_prompt: str = "", google_model: str = "gemini-2.5-flash") -> RunnableSerializable[dict[str, Any], str]:
    llm = ChatGoogleGenerativeAI(
        model=google_model
    )

    llm_json = llm.bind(
        automatic_function_calling=AutomaticFunctionCallingConfig(disable=True),
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{message}")
    ])
    
    agent = prompt | llm_json | StrOutputParser()
    return agent
