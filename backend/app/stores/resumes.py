import json
from array import array
from datetime import UTC, datetime
from functools import lru_cache

from redis.asyncio import Redis
from redis.exceptions import ResponseError
from redisvl.index import AsyncSearchIndex
from redisvl.query import VectorQuery
from redisvl.query.filter import Tag

from app.core.redis import get_redis_url
from app.resumes.embeddings import EMBEDDING_DIMENSIONS, embed_texts
from app.schemas.resume import ResumeChunk, ResumeDocument, StoredResumeDocument

RESUME_TTL_SECONDS = 24 * 60 * 60
DOCUMENT_KEY_PREFIX = "resume_document"
CHUNK_KEY_PREFIX = "resume_chunk:"
INDEX_NAME = "resume_chunks"

RESUME_INDEX_SCHEMA = {
    "index": {
        "name": INDEX_NAME,
        "prefix": CHUNK_KEY_PREFIX,
        "storage_type": "hash",
    },
    "fields": [
        {"name": "document_id", "type": "tag"},
        {"name": "chunk_id", "type": "tag"},
        {"name": "text", "type": "text"},
        {"name": "section", "type": "text"},
        {"name": "page_numbers", "type": "text"},
        {"name": "ordinal", "type": "numeric"},
        {"name": "created_at", "type": "numeric"},
        {
            "name": "embedding",
            "type": "vector",
            "attrs": {
                "dims": EMBEDDING_DIMENSIONS,
                "distance_metric": "cosine",
                "algorithm": "flat",
                "datatype": "float32",
            },
        },
    ],
}


@lru_cache
def get_resume_index() -> AsyncSearchIndex:
    return AsyncSearchIndex.from_dict(
        RESUME_INDEX_SCHEMA,
        redis_url=get_redis_url(),
    )


class ResumeStore:
    def __init__(self, redis: Redis, index: AsyncSearchIndex) -> None:
        self.redis = redis
        self.index = index

    # Creates the shared search index lazily because Redis may start after the
    # API process during local Docker development.
    async def ensure_index(self) -> None:
        if await self.index.exists():
            return

        try:
            await self.index.create()
        except ResponseError:
            if not await self.index.exists():
                raise

    # Writes metadata and vector chunks with the same TTL while retaining only
    # derived text; the uploaded PDF bytes never reach Redis.
    async def save(
        self,
        document: ResumeDocument,
        chunks: list[ResumeChunk],
        embeddings: list[list[float]],
    ) -> None:
        await self.ensure_index()
        created_at = int(document.created_at.timestamp())
        records = [
            {
                "document_id": chunk.document_id,
                "chunk_id": chunk.id,
                "text": chunk.text,
                "section": chunk.section,
                "page_numbers": json.dumps(chunk.page_numbers),
                "ordinal": chunk.ordinal,
                "created_at": created_at,
                "embedding": array("f", embedding).tobytes(),
            }
            for chunk, embedding in zip(chunks, embeddings, strict=True)
        ]
        await self.index.load(
            records,
            id_field="chunk_id",
            ttl=RESUME_TTL_SECONDS,
        )
        stored_document = StoredResumeDocument(
            **document.model_dump(),
            chunk_ids=[chunk.id for chunk in chunks],
        )
        await self.redis.set(
            self.document_key(document.id),
            stored_document.model_dump_json(),
            ex=RESUME_TTL_SECONDS,
        )

    async def get(self, document_id: str) -> StoredResumeDocument | None:
        payload = await self.redis.get(self.document_key(document_id))

        if payload is None:
            return None

        return StoredResumeDocument.model_validate_json(payload)
    
    # retrieval
    # Restricts every semantic search by document id so content from separate
    # uploaded resumes cannot be mixed into the same interview.
    async def retrieve(self, document_id: str, query_text: str) -> list[str]:
        document = await self.get(document_id)

        if document is None:
            return []

        await self.ensure_index()
        query_embedding = (await embed_texts([query_text]))[0]
        query = VectorQuery(
            vector=query_embedding,
            vector_field_name="embedding",
            return_fields=["text", "section", "page_numbers"],
            filter_expression=Tag("document_id") == document_id,
            num_results=min(4, document.chunk_count),
        )
        results = await self.index.query(query)

        return [result["text"] for result in results if result.get("text")]

    async def refresh(self, document: StoredResumeDocument) -> None:
        keys = [
            self.document_key(document.id),
            *[f"{CHUNK_KEY_PREFIX}{chunk_id}" for chunk_id in document.chunk_ids],
        ]
        pipeline = self.redis.pipeline()

        for key in keys:
            pipeline.expire(key, RESUME_TTL_SECONDS)

        await pipeline.execute()

    @staticmethod
    def document_key(document_id: str) -> str:
        return f"{DOCUMENT_KEY_PREFIX}:{document_id}"


def build_resume_document(
    document_id: str,
    filename: str,
    page_count: int,
    chunk_count: int,
) -> ResumeDocument:
    return ResumeDocument(
        id=document_id,
        filename=filename,
        page_count=page_count,
        chunk_count=chunk_count,
        created_at=datetime.now(UTC),
    )
