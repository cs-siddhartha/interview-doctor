import base64
import binascii
from datetime import UTC, datetime
from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from redis.asyncio import Redis

from app.core.redis import get_redis_client
from app.providers.registry import (
    ProviderNotConfiguredError,
    ProviderNotImplementedError,
    UnsupportedProviderTransportError,
    build_provider_stack,
)
from app.providers.tts.base import TTSProviderBase
from app.providers.tts.openai import OpenAITTSProvider
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
        provider_stack = build_provider_stack(request.providers)
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
    except ProviderNotConfiguredError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(error),
        ) from error

    try:
        interviewer_text = await provider_stack.llm.generate_response(
            candidate_answer=None,
            context={
                "mode": request.mode,
                "setup": request.setup.model_dump(mode="json"),
                "transcript": [],
            },
        )
    except RuntimeError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(error),
        ) from error

    opening_audio, opening_audio_error = await synthesize_interviewer_audio(
        provider_stack.tts,
        interviewer_text,
    )

    interviewer_turn = TranscriptTurn(
        speaker=TranscriptSpeaker.AI_INTERVIEWER,
        text=interviewer_text,
        created_at=now,
    )

    session = Session(
        id=str(uuid4()),
        mode=request.mode,
        providers=ProviderSelection(
            stt=request.providers.stt,
            llm=request.providers.llm,
            tts=request.providers.tts,
        ),
        setup=request.setup,
        state=SessionState.LISTENING,
        transcript=[interviewer_turn],
        opening_audio_base64=base64.b64encode(opening_audio).decode("ascii"),
        opening_audio_error=opening_audio_error,
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
    except ProviderNotConfiguredError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(error),
        ) from error

    try:
        audio = decode_turn_audio(request.audio_base64)
        transcript = await provider_stack.stt.transcribe(audio, request.mime_type)
        ai_text = await provider_stack.llm.generate_response(
            candidate_answer=transcript,
            context=session.model_dump(mode="json"),
        )
    except RuntimeError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(error),
        ) from error

    ai_audio, audio_error = await synthesize_interviewer_audio(
        provider_stack.tts,
        ai_text,
    )
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
            audio_error=audio_error,
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


# Falls back to OpenAI speech when the selected provider fails so interview
# questions remain audible while preserving the primary failure for the UI.
async def synthesize_interviewer_audio(
    selected_provider: TTSProviderBase,
    text: str,
) -> tuple[bytes, str | None]:
    try:
        return await selected_provider.synthesize(text), None
    except RuntimeError as primary_error:
        fallback_provider = OpenAITTSProvider()

        try:
            return await fallback_provider.synthesize(text), str(primary_error)
        except RuntimeError:
            return b"", str(primary_error)
