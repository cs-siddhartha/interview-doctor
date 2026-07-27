import os
from functools import lru_cache

from redis.asyncio import Redis

DEFAULT_REDIS_URL = "redis://localhost:6380/0"


def get_redis_url() -> str:
    return os.getenv("REDIS_URL", DEFAULT_REDIS_URL)


# Provides one async Redis client for short-lived interview session state so
# request handlers do not need to know environment variable or connection details.
@lru_cache
def get_redis_client() -> Redis:
    return Redis.from_url(
        get_redis_url(),
        decode_responses=True,
    )
