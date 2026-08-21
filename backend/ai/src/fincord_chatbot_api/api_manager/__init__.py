from langchain.agents.middleware.types import AgentState, InputAgentState, OutputAgentState
from langgraph.graph.state import CompiledStateGraph
from qdrant_client import AsyncQdrantClient

from fastapi import FastAPI, HTTPException, Request, Depends
import uvicorn
from contextlib import asynccontextmanager
from pydantic import BaseModel
from pydantic.json_schema import SkipJsonSchema
from os import getenv
from typing import Any

from fincord_chatbot_api.vector_store_manager import update_records_data_to_vector_store, create_default_qdrant_client, VectorStoreManagerStorage
from fincord_chatbot_api.ai_manager import create_ai_stream_by_message, extract_token_from_ai_response_stream
from fincord_chatbot_api.type_manager import PendingSyncToVectorStoreData, AgentContextSchema


    
class AskRequestDataType(BaseModel):
    user_id: str
    message: str
    pending_data: list[PendingSyncToVectorStoreData]



def run_api(agent: CompiledStateGraph[AgentState[Any], AgentContextSchema, InputAgentState, OutputAgentState[Any]]):
        # ? Create lifespan
        @asynccontextmanager
        async def lifespan(app: FastAPI):
                app.state.qdrant_client = await create_default_qdrant_client(collection_name=VectorStoreManagerStorage.collection_name)
                yield
                await app.state.qdrant_client.close()

        def get_qdrant_client(request: Request) -> SkipJsonSchema[AsyncQdrantClient]:
                return request.app.state.qdrant_client


        # ? Setup API
        app = FastAPI(title="AI API Endpoint!", version="0.1.0", lifespan=lifespan)
        key_access = getenv("KEY_ACCESS")
        if not key_access:
                raise Exception("KEY_ACCESS environment doesn't exists!")
        
        # ? Create route to ask AI
        @app.post("/ask")
        async def ask(request: Request, tx: AskRequestDataType, qdrant_client: SkipJsonSchema[AsyncQdrantClient] = Depends(get_qdrant_client)):
                # ? Verify request is really from the server
                key_access_cookie: str | None = request.cookies.get("key_access")
                if not key_access_cookie or key_access != key_access_cookie:
                        raise HTTPException(status_code=401, detail="Not authorized")
                

                # ? Check the pending sync
                try:
                        await update_records_data_to_vector_store(qdrant_client=qdrant_client, collection_name=VectorStoreManagerStorage.collection_name, embeddings=VectorStoreManagerStorage.embeddings, user_id=tx.user_id, pending_data=tx.pending_data)
                except Exception as e:
                        print(f"There's an error when trying to update vector store. Error: {e}")
                        raise HTTPException(status_code=500, detail="There's an error when trying to update vector store")
                        

                # ? Talk to AI
                stream = await create_ai_stream_by_message(context_schema=AgentContextSchema(qdrant_client=qdrant_client), agent=agent, message=tx.message)
                response = await extract_token_from_ai_response_stream(stream)

                return {"response": response}


        uvicorn.run(app, host="0.0.0.0", port=8081)