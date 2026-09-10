import hashlib
import hmac
import os
import time
from typing import Annotated

from fastapi import Depends, Header, HTTPException, Query, status
from redis.asyncio import Redis

from app.core.redis import get_redis_client

BACKEND_API_TOKEN_ENV = "BACKEND_API_TOKEN"
BACKEND_TOKEN_HEADER = "X-Interview-Doctor-Key"
WEBSOCKET_TOKEN_LIFETIME_SECONDS = 90
API_REQUESTS_PER_MINUTE = 120
FRONTEND_ORIGINS_ENV = "FRONTEND_ORIGINS"
DEFAULT_FRONTEND_ORIGINS = "http://localhost:3000"


def require_backend_token(
    token: Annotated[str | None, Header(alias=BACKEND_TOKEN_HEADER)] = None,
) -> None:
    """Protect server-to-server HTTP routes with the configured shared token."""
    expected = os.getenv(BACKEND_API_TOKEN_ENV)
    if not expected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Backend access control is not configured.",
        )
    if token is None or not hmac.compare_digest(token, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid backend access token.",
        )


async def require_api_rate_limit(
    redis: Annotated[Redis, Depends(get_redis_client)],
) -> None:
    """Apply one shared request budget to this private backend installation."""
    window = int(time.time()) // 60
    key = f"api_rate_limit:{window}"
    count = await redis.incr(key)
    if count == 1:
        await redis.expire(key, 61)
    if count > API_REQUESTS_PER_MINUTE:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="API request limit exceeded. Try again shortly.",
            headers={"Retry-After": "60"},
        )


def validate_websocket_token(session_id: str, token: str) -> bool:
    """Validate a short-lived HMAC token bound to one realtime session id."""
    secret = os.getenv(BACKEND_API_TOKEN_ENV)
    if not secret:
        return False

    try:
        expires_value, signature = token.split(".", maxsplit=1)
        expires_at = int(expires_value)
    except (ValueError, TypeError):
        return False

    now = int(time.time())
    if expires_at < now or expires_at > now + WEBSOCKET_TOKEN_LIFETIME_SECONDS:
        return False

    message = f"{session_id}:{expires_at}".encode()
    expected = hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()
    return hmac.compare_digest(signature, expected)


def is_websocket_origin_allowed(origin: str | None) -> bool:
    """Restrict browser socket handshakes to configured frontend origins."""
    allowed = {
        value.strip()
        for value in os.getenv(
            FRONTEND_ORIGINS_ENV,
            DEFAULT_FRONTEND_ORIGINS,
        ).split(",")
        if value.strip()
    }
    return origin in allowed


WebSocketToken = Annotated[str, Query(min_length=1, max_length=256)]
