from langchain_core.tools import tool, BaseTool
from langchain.tools import ToolRuntime
from langchain.agents import create_agent
from langchain.agents.middleware.types import AgentState, InputAgentState, OutputAgentState
from langgraph.graph.state import CompiledStateGraph

from qdrant_client import models
from qdrant_client.conversions.common_types import QueryResponse

from typing import Any, TYPE_CHECKING
from collections.abc import AsyncIterator
from datetime import datetime
from uuid import UUID

from fincord_chatbot_api.vector_store_manager import VectorStoreManagerStorage
from fincord_chatbot_api.type_manager import AgentContextSchema, JobResult

if TYPE_CHECKING:
    from _typeshed import DataclassInstance

# ? Static Variables
class AIManagerStorage:
    system_prompt: str = ""      


# ? AI tools
@tool
def get_time() -> str:
    """Returns current date in ISO 8601 format"""
    print("Get Date!")
    return datetime.now().astimezone().isoformat()


@tool
async def search_transactions(runtime: ToolRuntime[AgentContextSchema], query: str) -> str:
    """Search transaction records by keywords (query) using vector similarity search"""
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
                )
            ]
        ),
        limit=5,
        with_payload=True
    )
    print("Query done!")

    return "\n\n".join([document.payload['content'] for document in resulted_documents.points if document.payload])

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


def build_default_agent(context_schema: type[DataclassInstance], tools: list[BaseTool], system_prompt: str) -> CompiledStateGraph[AgentState[Any], DataclassInstance, InputAgentState, OutputAgentState[Any]]:
    agent = create_agent(
        model="google_genai:gemma-4-31b-it",
        tools=tools,
        system_prompt=system_prompt,
        context_schema=context_schema,
        state_schema=AgentState
    )
    return agent