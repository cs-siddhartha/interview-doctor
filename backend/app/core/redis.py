import os
from functools import lru_cache

from redis.asyncio import Redis

DEFAULT_REDIS_URL = "redis://localhost:6379/0"


# Provides one async Redis client for short-lived interview session state so
# request handlers do not need to know environment variable or connection details.
@lru_cache
def get_redis_client() -> Redis:
    return Redis.from_url(
        os.getenv("REDIS_URL", DEFAULT_REDIS_URL),
        decode_responses=True,
    )
