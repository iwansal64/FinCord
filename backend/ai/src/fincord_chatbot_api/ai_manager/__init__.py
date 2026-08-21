from langchain_core.tools import tool, BaseTool
from langchain.agents import create_agent
from langchain.agents.middleware.types import AgentState, InputAgentState, OutputAgentState
from langgraph.stream import AsyncGraphRunStream
from langgraph.graph.state import CompiledStateGraph

from qdrant_client.http.models import Filter, FieldCondition, MatchValue
from qdrant_client import models
from qdrant_client.conversions.common_types import QueryResponse

from typing import Any, TYPE_CHECKING
from datetime import datetime

from fincord_chatbot_api.vector_store_manager import VectorStoreManagerStorage
from fincord_chatbot_api.type_manager import AgentContextSchema

if TYPE_CHECKING:
    from _typeshed import DataclassInstance


# ? AI tools
@tool
def get_time() -> str:
    """Returns current date in ISO 8601 format"""
    return datetime.now().astimezone().isoformat()

@tool
async def search_transactions(context: AgentContextSchema, user_id: int, query: str, k: int = 4) -> str:
    """Search transaction records by keyword (query) using vector similarity search for specific user id"""
    # TODO Finish this function!
    # ? Create filter
    qdrant_filter = Filter(
        must=[
            FieldCondition(
                key="metadata.user_id",
                match=MatchValue(value=user_id)
            )
        ]
    )

    # ? Get the records we actually wanted by using vector cosine similarity search
    qdrant_client = context.qdrant_client
    resulted_documents: QueryResponse = await qdrant_client.query_points(
        collection_name=VectorStoreManagerStorage.collection_name,
        query=VectorStoreManagerStorage.embeddings.embed_query(query),
        query_filter=models.Filter(
            must=[
                models.FieldCondition(
                        key="user_id",
                        match=models.MatchValue(value=user_id)
                )
            ]
        ),
        limit=5,
        with_payload=True
    )


    return "\n\n".join([document.payload['content'] for document in resulted_documents.points if document.payload])

# ? Utility functions
async def create_ai_stream_by_message[T: "DataclassInstance"](context_schema: T,agent: CompiledStateGraph[AgentState[Any], T, InputAgentState, OutputAgentState[Any]], message: str) -> AsyncGraphRunStream:
    stream = await agent.astream_events(
        input={
            "messages": [
                {
                    "role": "user",
                    "content": message
                }
            ]
        },
        context=context_schema,
        version="v3"
    )
    return stream

async def extract_token_from_ai_response_stream(stream: AsyncGraphRunStream):
        response = ""
        async for chunk in stream.messages:
                for token in (await chunk).text:
                        response += token
        return response


def build_default_agent[T: "DataclassInstance"](context_schema: type[T], tools: list[BaseTool], system_prompt: str) -> CompiledStateGraph[AgentState[Any], T, InputAgentState, OutputAgentState[Any]]:
    return create_agent(
        model="google_genai:gemini-3.5-flash",
        tools=tools,
        system_prompt=system_prompt,
        context_schema=context_schema,
        state_schema=AgentState
    )