from qdrant_client import AsyncQdrantClient

from pydantic import BaseModel, field_validator, ConfigDict, model_validator
from pydantic.json_schema import SkipJsonSchema
from datetime import date, datetime
from dataclasses import dataclass

from typing import Literal, Any

class PendingSyncTransactions(BaseModel):
    """This class is used for transactions data that are in pending to get sync to vector store"""
    id: int
    title: str | None
    description: str | None
    created_at: date | None
    amount: int | None
    is_deleted: bool

    @field_validator("created_at", mode="before")
    @classmethod
    def parse_iso_datetime(cls, value):
        if(isinstance(value, str)):
            try:
                # Dynamically attempts to parse a full ISO timestamp first
                return datetime.fromisoformat(value).date()
            except ValueError:
                print("ERROR PARSE")
                pass # Fallback to standard Pydantic date parsing rules
        return value

    @model_validator(mode='before')
    @classmethod
    def exclude_none_inputs(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Remove keys where the explicit value is None
            return {k: v for k, v in data.items() if v is not None}
        return data


# ? Create context schema
@dataclass
class AgentContextSchema:
    qdrant_client: SkipJsonSchema[AsyncQdrantClient]
    user_id: int


# ? Used for storing AI job state
class JobResult:
        def __init__(self, status: Literal["running", "finished", "error"], message: str | None) -> None:
                self.status = status
                self.message = message
                self.steps = []