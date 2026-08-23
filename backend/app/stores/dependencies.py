from typing import Annotated

from fastapi import Depends
from redis.asyncio import Redis

from app.core.redis import get_redis_client
from app.stores.sessions import SessionStore


def get_session_store(
    redis: Annotated[Redis, Depends(get_redis_client)],
) -> SessionStore:
    """Provide request and WebSocket handlers with the shared Redis session store."""
    return SessionStore(redis)


SessionStoreDep = Annotated[SessionStore, Depends(get_session_store)]
