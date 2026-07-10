from datetime import UTC, datetime
from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from redis.asyncio import Redis

from app.core.redis import get_redis_client
from app.providers.registry import build_provider_stack
from app.schemas.common import ApiMeta, ApiResponse
from app.schemas.session import (
    CreateSessionRequest,
    ProviderSelection,
    Session,
    SessionState,
)
from app.stores.sessions import SessionStore

router = APIRouter(prefix="/sessions", tags=["sessions"])


def get_session_store(
    redis: Annotated[Redis, Depends(get_redis_client)],
) -> SessionStore:
    return SessionStore(redis)


SessionStoreDep = Annotated[SessionStore, Depends(get_session_store)]


@router.post(
    "",
    response_model=ApiResponse[Session],
    status_code=status.HTTP_201_CREATED,
)
async def create_session(
    request: CreateSessionRequest,
    session_store: SessionStoreDep,
) -> ApiResponse[Session]:
    now = datetime.now(UTC)
    build_provider_stack(request.providers)

    session = Session(
        id=str(uuid4()),
        mode=request.mode,
        providers=ProviderSelection(
            stt=request.providers.stt,
            llm=request.providers.llm,
            tts=request.providers.tts,
        ),
        setup=request.setup,
        state=SessionState.SETUP_COMPLETE,
        created_at=now,
        updated_at=now,
    )

    await session_store.save(session)

    return ApiResponse(data=session, meta=ApiMeta(timestamp=now))


@router.get(
    "/{session_id}",
    response_model=ApiResponse[Session],
)
async def get_session(
    session_id: str,
    session_store: SessionStoreDep,
) -> ApiResponse[Session]:
    now = datetime.now(UTC)
    session = await session_store.get(session_id)

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    return ApiResponse(data=session, meta=ApiMeta(timestamp=now))
