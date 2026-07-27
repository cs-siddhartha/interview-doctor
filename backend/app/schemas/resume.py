from datetime import datetime

from pydantic import BaseModel, Field


class ResumeDocument(BaseModel):
    id: str
    filename: str
    page_count: int = Field(gt=0)
    chunk_count: int = Field(gt=0)
    created_at: datetime


class ResumeChunk(BaseModel):
    id: str
    document_id: str
    text: str = Field(min_length=1)
    section: str = ""
    page_numbers: list[int] = Field(default_factory=list)
    ordinal: int = Field(ge=0)


class StoredResumeDocument(ResumeDocument):
    chunk_ids: list[str] = Field(default_factory=list)

