from langchain.agents.middleware.types import InputAgentState, OutputAgentState, AgentState
from langgraph.graph.state import CompiledStateGraph

from qdrant_client import AsyncQdrantClient
from fastapi import FastAPI, HTTPException, Request, Depends, BackgroundTasks
import uvicorn

from contextlib import asynccontextmanager
from pydantic import BaseModel
from pydantic.json_schema import SkipJsonSchema
from os import getenv
from typing import Literal, TYPE_CHECKING, Any
from uuid import uuid4, UUID

from fincord_chatbot_api.vector_store_manager import update_records_data_to_vector_store, create_default_qdrant_client, VectorStoreManagerStorage
from fincord_chatbot_api.ai_manager import send_message_to_ai, build_default_agent, get_time, search_transactions, AIManagerStorage
from fincord_chatbot_api.type_manager import PendingSyncTransactions, AgentContextSchema

if TYPE_CHECKING:
    from _typeshed import DataclassInstance

    
class AskRequestDataType(BaseModel):
        user_id: int
        message: str
        pending_data: list[PendingSyncTransactions]

class GetRequestDataType(BaseModel):
        job_id: UUID
        with_steps: bool | None = None


class JobResult:
        def __init__(self, status: Literal["running", "finished", "error"], message: str | None) -> None:
                self.status = status
                self.message = message
                self.steps = []


def run_api():
        # ? Create lifespan
        @asynccontextmanager
        async def lifespan(app: FastAPI):
                app.state.qdrant_client = await create_default_qdrant_client(collection_name=VectorStoreManagerStorage.collection_name)
                app.state.agent = build_default_agent(
                        context_schema=AgentContextSchema,
                        tools=[get_time, search_transactions],
                        system_prompt=AIManagerStorage.system_prompt
                )
                yield
                await app.state.qdrant_client.close()

        def get_qdrant_client(request: Request) -> SkipJsonSchema[AsyncQdrantClient]:
                return request.app.state.qdrant_client

        def get_agent(request: Request) -> SkipJsonSchema[CompiledStateGraph[AgentState[Any], DataclassInstance, InputAgentState, OutputAgentState[Any]]]:
                return request.app.state.agent


        # ? Setup API
        app = FastAPI(title="AI API Endpoint!", version="0.1.0", lifespan=lifespan)
        key_access = getenv("KEY_ACCESS")
        if not key_access:
                raise Exception("KEY_ACCESS environment doesn't exists!")

        job_ids: dict[UUID, JobResult] = {}

        # ? Create function to handle task
        async def add_task(job_id: UUID, message: str, user_id: int, pending_data: list[PendingSyncTransactions], qdrant_client: SkipJsonSchema[AsyncQdrantClient], agent: SkipJsonSchema[CompiledStateGraph[AgentState[Any], DataclassInstance, InputAgentState, OutputAgentState[Any]]]) -> None:
                # ? Add to job_ids
                print("Create a JOB")
                job_ids[job_id] = JobResult(
                        status="running",
                        message=None
                )
                
                # ? Check the pending sync
                try:
                        print("Update records to vector store")
                        await update_records_data_to_vector_store(qdrant_client=qdrant_client, collection_name=VectorStoreManagerStorage.collection_name, embeddings=VectorStoreManagerStorage.embeddings, user_id=user_id, pending_transaction=pending_data)
                except Exception as e:
                        print(f"There's an error when trying to update vector store. Error: {e}")
                        job_ids[job_id].status = "error"
                        job_ids[job_id].message = "There's an error when trying to update vector store"
                        return
                

                # ? Talk to AI
                try:
                        print("Talk to AI")
                        response = send_message_to_ai(context_schema=AgentContextSchema(qdrant_client=qdrant_client, user_id=user_id), agent=agent, message=message)
                        async for chunk in response:
                                for node, data in chunk["data"].items():
                                        if "messages" not in data:
                                                continue

                                        for message in data["messages"]:
                                                print("MESSAGE IN")
                                                if isinstance(message, str) or not getattr(message, "content"):
                                                        continue

                                                if node == "model":
                                                        print(message)
                                                        if getattr(message, "content"):
                                                                contents = getattr(message, "content", {})
                                                                for content in contents:
                                                                        if "type" not in content:
                                                                                job_ids[job_id].steps.append(
                                                                                        {"type": "unknown", "content": content}
                                                                                )
                                                                                continue

                                                                        content_type = content.get("type", "")
                                                                        if content_type == "thinking" and "thinking" in content:
                                                                                job_ids[job_id].steps.append(
                                                                                        {"type": "thinking", "content": content["thinking"]}
                                                                                )
                                                                        elif content_type == "text" and "text" in content:
                                                                                job_ids[job_id].status = "finished"
                                                                                job_ids[job_id].message = content["text"]


                                                        if getattr(message, "tool_calls"):
                                                                for call in getattr(message, "tool_calls", []):
                                                                        job_ids[job_id].steps.append(
                                                                                {"type": "tool_call", "tool": call["name"], "args": call["args"]}
                                                                        )

                                                                
                                                elif node == "tools":
                                                        job_ids[job_id].steps.append(
                                                                {"type": "tool_result", "tool": getattr(message, "name", None), "content": getattr(message, "content", None)}
                                                        )

                
                except Exception as e:
                        print(f"There's an error when trying to get AI response. Error: {e}")
                        job_ids[job_id].status = "error"
                        job_ids[job_id].message = "There's an error when trying to get AI response"
                        return
        
        def check_access(request: Request) -> bool:
                key_access_cookie: str | None = request.cookies.get("key_access")
                if not key_access_cookie or key_access != key_access_cookie:
                        return False
                return True
        
        # ? Create route to ask AI
        @app.post("/ask")
        async def ask(request: Request, tx: AskRequestDataType, background_tasks: BackgroundTasks, qdrant_client: SkipJsonSchema[AsyncQdrantClient] = Depends(get_qdrant_client), agent: SkipJsonSchema[CompiledStateGraph[AgentState[Any], DataclassInstance, InputAgentState, OutputAgentState[Any]]] = Depends(get_agent)):
                # ? Verify request is really from the server
                if not check_access(request):
                        raise HTTPException(status_code=401, detail="Not authorized")

                        
                job_id = uuid4()
                background_tasks.add_task(
                        func=add_task,
                        job_id=job_id,
                        user_id=tx.user_id,
                        pending_data=tx.pending_data,
                        message=tx.message,
                        qdrant_client=qdrant_client,
                        agent=agent
                )

                return {"job_id": job_id}

        @app.post("/get")
        async def get(request: Request, tx: GetRequestDataType):
                # ? Verify request is really from the server
                if not check_access(request):
                        raise HTTPException(status_code=401, detail="Not authorized")

                try:
                        job = job_ids[tx.job_id]

                        if tx.with_steps:
                                return {
                                        "status": job.status,
                                        "message": job.message,
                                        "steps": job.steps
                                }

                        return {
                                "status": job.status,
                                "message": job.message
                        }
                except KeyError:
                        raise HTTPException(status_code=404, detail="ID not found")
                except Exception as e:
                        print(f"Error when getting job ids. Error: {e}")
                        raise HTTPException(status_code=500, detail="There's server error")

        uvicorn.run(app, host="0.0.0.0", port=8081)