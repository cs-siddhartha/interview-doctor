import base64
import binascii
from datetime import UTC, datetime
from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from redis.asyncio import Redis

from app.core.redis import get_redis_client
from app.providers.registry import (
    ProviderNotImplementedError,
    UnsupportedProviderTransportError,
    build_provider_stack,
)
from app.schemas.common import ApiMeta, ApiResponse
from app.schemas.session import (
    CreateSessionRequest,
    CreateTurnRequest,
    ProviderSelection,
    Session,
    SessionState,
    TranscriptSpeaker,
    TranscriptTurn,
    TurnResult,
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

    try:
        build_provider_stack(request.providers)
    except UnsupportedProviderTransportError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error
    except ProviderNotImplementedError as error:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=str(error),
        ) from error

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


@router.post(
    "/{session_id}/turns",
    response_model=ApiResponse[TurnResult],
)
async def create_turn(
    session_id: str,
    request: CreateTurnRequest,
    session_store: SessionStoreDep,
) -> ApiResponse[TurnResult]:
    now = datetime.now(UTC)
    session = await session_store.get(session_id)

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    try:
        provider_stack = build_provider_stack(session.providers)
    except UnsupportedProviderTransportError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error
    except ProviderNotImplementedError as error:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=str(error),
        ) from error

    audio = decode_turn_audio(request.audio_base64)
    transcript = await provider_stack.stt.transcribe(audio)
    ai_text = await provider_stack.llm.generate_response(
        prompt=transcript,
        context=session.model_dump(mode="json"),
    )
    ai_audio = await provider_stack.tts.synthesize(ai_text)
    candidate_turn = TranscriptTurn(
        speaker=TranscriptSpeaker.CANDIDATE,
        text=transcript,
        created_at=now,
    )
    ai_turn = TranscriptTurn(
        speaker=TranscriptSpeaker.AI_INTERVIEWER,
        text=ai_text,
        created_at=datetime.now(UTC),
    )

    session.transcript.extend([candidate_turn, ai_turn])
    session.state = SessionState.LISTENING
    session.updated_at = datetime.now(UTC)
    await session_store.save(session)

    return ApiResponse(
        data=TurnResult(
            session_id=session.id,
            candidate_turn=candidate_turn,
            ai_turn=ai_turn,
            audio_base64=base64.b64encode(ai_audio).decode("ascii"),
            state=session.state,
        ),
        meta=ApiMeta(timestamp=datetime.now(UTC)),
    )


def decode_turn_audio(audio_base64: str) -> bytes:
    if not audio_base64:
        return b""

    try:
        return base64.b64decode(audio_base64, validate=True)
    except binascii.Error as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid audio payload",
        ) from error
