from qdrant_client import AsyncQdrantClient

from pydantic import BaseModel, field_validator
from pydantic.json_schema import SkipJsonSchema
from datetime import date, datetime
from dataclasses import dataclass

class PendingSyncToVectorStoreData(BaseModel):
    transaction_title: str
    transaction_description: str | None
    transaction_date: date
    transaction_amount: int
    transaction_id: str
    is_deleted: bool

    @field_validator("transaction_date", mode="before")
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