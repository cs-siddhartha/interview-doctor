import asyncio
import os
from typing import Any

from app.providers.http import post_json

OPENAI_EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings"
OPENAI_API_KEY_ENV = "OPENAI_API_KEY"
OPENAI_EMBEDDING_MODEL_ENV = "OPENAI_EMBEDDING_MODEL"
DEFAULT_OPENAI_EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 1536

async def embed_texts(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []

    api_key = os.getenv(OPENAI_API_KEY_ENV)

    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is required to index resume content")

    return await asyncio.to_thread(_embed_texts_sync, texts, api_key)


def _embed_texts_sync(texts: list[str], api_key: str) -> list[list[float]]:
    try:
        payload = post_json(
            OPENAI_EMBEDDINGS_URL,
            {
                "model": os.getenv(
                    OPENAI_EMBEDDING_MODEL_ENV,
                    DEFAULT_OPENAI_EMBEDDING_MODEL,
                ),
                "input": texts,
            },
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=60,
        )
    except Exception as error:
        raise RuntimeError("OpenAI resume embedding request failed") from error

    embeddings = extract_embeddings(payload)

    if len(embeddings) != len(texts):
        raise RuntimeError("OpenAI returned an incomplete embedding response")

    return embeddings


def extract_embeddings(payload: dict[str, Any]) -> list[list[float]]:
    ordered = sorted(payload.get("data", []), key=lambda item: item.get("index", -1))
    embeddings = [item.get("embedding") for item in ordered]

    if not embeddings or any(
        not isinstance(embedding, list)
        or len(embedding) != EMBEDDING_DIMENSIONS
        for embedding in embeddings
    ):
        raise RuntimeError("OpenAI returned invalid resume embeddings")

    return embeddings
