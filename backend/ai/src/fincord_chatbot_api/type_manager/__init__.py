from qdrant_client import AsyncQdrantClient

from pydantic import BaseModel, field_validator
from pydantic.json_schema import SkipJsonSchema
from datetime import date, datetime
from dataclasses import dataclass

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
                pass # Fallback to standard Pydantic date parsing rules
        return value


# ? Create context schema
@dataclass
class AgentContextSchema:
    qdrant_client: SkipJsonSchema[AsyncQdrantClient]
    user_id: int