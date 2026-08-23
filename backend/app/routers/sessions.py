import base64
import binascii
import logging
from datetime import UTC, datetime
from uuid import uuid4

from fastapi import APIRouter, HTTPException, status

from app.providers.registry import (
    ProviderNotConfiguredError,
    ProviderNotImplementedError,
    UnsupportedProviderTransportError,
    build_provider_stack,
)
from app.providers.tts.base import TTSProviderBase
from app.providers.tts.openai import OpenAITTSProvider
from app.realtime.config import (
    UnsupportedRealtimeStackError,
    validate_realtime_stack,
)
from app.resumes.context import (
    ResumeDocumentNotFoundError,
    get_current_question,
    get_resume_evidence,
)
from app.resumes.dependencies import ResumeStoreDep
from app.schemas.common import ApiMeta, ApiResponse
from app.schemas.session import (
    CreateSessionRequest,
    CreateTurnRequest,
    ProviderSelection,
    Session,
    SessionState,
    SessionTransport,
    TranscriptSpeaker,
    TranscriptTurn,
    TurnResult,
    UpdateSessionRequest,
)
from app.stores.dependencies import SessionStoreDep

router = APIRouter(prefix="/sessions", tags=["sessions"])
logger = logging.getLogger("interview_doctor.sessions")


@router.post(
    "",
    response_model=ApiResponse[Session],
    status_code=status.HTTP_201_CREATED,
)
async def create_session(
    request: CreateSessionRequest,
    session_store: SessionStoreDep,
    resume_store: ResumeStoreDep,
) -> ApiResponse[Session]:
    now = datetime.now(UTC)
    logger.info(
        "[backend.session] creating mode=%s transport=%s stt=%s llm=%s tts=%s",
        request.mode,
        request.transport,
        request.providers.stt.provider,
        request.providers.llm.provider,
        request.providers.tts.provider,
    )

    if request.transport == SessionTransport.WEBSOCKET:
        try:
            validate_realtime_stack(request.providers)
        except UnsupportedRealtimeStackError as error:
            logger.warning("[backend.session] realtime stack rejected error=%s", error)
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=str(error),
            ) from error

    try:
        provider_stack = build_provider_stack(request.providers)
    except UnsupportedProviderTransportError as error:
        logger.warning("[backend.session] provider transport rejected error=%s", error)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error
    except ProviderNotImplementedError as error:
        logger.warning("[backend.session] provider not implemented error=%s", error)
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=str(error),
        ) from error
    except ProviderNotConfiguredError as error:
        logger.warning("[backend.session] provider not configured error=%s", error)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(error),
        ) from error

    try:
        resume_evidence = await get_resume_evidence(
            request.mode,
            request.setup,
            resume_store,
        )
        interviewer_text = await provider_stack.llm.generate_response(
            candidate_answer=None,
            context={
                "mode": request.mode,
                "setup": request.setup.model_dump(mode="json"),
                "transcript": [],
                "resume_evidence": resume_evidence,
            },
        )
    except ResumeDocumentNotFoundError as error:
        logger.warning("[backend.session] resume context unavailable error=%s", error)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error
    except RuntimeError as error:
        logger.exception("[backend.session] opening question generation failed")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(error),
        ) from error

    if request.transport == SessionTransport.WEBSOCKET:
        opening_audio, opening_audio_error = b"", None
    else:
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
        transport=request.transport,
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
    logger.info(
        "[backend.session] created session_id=%s state=%s "
        "opening_audio_bytes=%d audio_fallback=%s",
        session.id,
        session.state,
        len(opening_audio),
        opening_audio_error is not None,
    )

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
        logger.warning("[backend.session] lookup missed session_id=%s", session_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    logger.info(
        "[backend.session] loaded session_id=%s state=%s turns=%d",
        session_id,
        session.state,
        len(session.transcript),
    )
    return ApiResponse(data=session, meta=ApiMeta(timestamp=now))


@router.patch(
    "/{session_id}",
    response_model=ApiResponse[Session],
)
async def update_session(
    session_id: str,
    request: UpdateSessionRequest,
    session_store: SessionStoreDep,
) -> ApiResponse[Session]:
    now = datetime.now(UTC)
    session = await session_store.get(session_id)

    if session is None:
        logger.warning("[backend.session] update missed session_id=%s", session_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    previous_state = session.state
    session.state = request.state
    session.updated_at = now
    await session_store.save(session)
    logger.info(
        "[backend.session] state updated session_id=%s from=%s to=%s",
        session_id,
        previous_state,
        session.state,
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
    resume_store: ResumeStoreDep,
) -> ApiResponse[TurnResult]:
    now = datetime.now(UTC)
    logger.info(
        "[backend.turn] received session_id=%s mime_type=%s encoded_audio_chars=%d",
        session_id,
        request.mime_type,
        len(request.audio_base64),
    )
    session = await session_store.get(session_id)

    if session is None:
        logger.warning("[backend.turn] session missing session_id=%s", session_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    if session.state == SessionState.SESSION_END:
        logger.warning("[backend.turn] rejected ended session_id=%s", session_id)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Session has ended",
        )

    try:
        provider_stack = build_provider_stack(session.providers)
    except UnsupportedProviderTransportError as error:
        logger.warning(
            "[backend.turn] provider transport rejected session_id=%s error=%s",
            session_id,
            error,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error
    except ProviderNotImplementedError as error:
        logger.warning(
            "[backend.turn] provider not implemented session_id=%s error=%s",
            session_id,
            error,
        )
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=str(error),
        ) from error
    except ProviderNotConfiguredError as error:
        logger.warning(
            "[backend.turn] provider not configured session_id=%s error=%s",
            session_id,
            error,
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(error),
        ) from error

    try:
        audio = decode_turn_audio(request.audio_base64)
        logger.info(
            "[backend.turn] transcribing session_id=%s audio_bytes=%d provider=%s",
            session_id,
            len(audio),
            session.providers.stt.provider,
        )
        transcript = await provider_stack.stt.transcribe(audio, request.mime_type)
        logger.info(
            "[backend.turn] transcription completed session_id=%s transcript_chars=%d",
            session_id,
            len(transcript),
        )
        resume_evidence = await get_resume_evidence(
            session.mode,
            session.setup,
            resume_store,
            candidate_answer=transcript,
            current_question=get_current_question(session),
        )
        context = session.model_dump(mode="json")
        context["resume_evidence"] = resume_evidence
        ai_text = await provider_stack.llm.generate_response(
            candidate_answer=transcript,
            context=context,
        )
        logger.info(
            "[backend.turn] response generated session_id=%s response_chars=%d",
            session_id,
            len(ai_text),
        )
    except ResumeDocumentNotFoundError as error:
        logger.warning(
            "[backend.turn] resume context unavailable session_id=%s error=%s",
            session_id,
            error,
        )
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error
    except RuntimeError as error:
        logger.exception(
            "[backend.turn] provider pipeline failed session_id=%s", session_id
        )
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
    logger.info(
        "[backend.turn] completed session_id=%s state=%s "
        "transcript_turns=%d audio_bytes=%d audio_fallback=%s",
        session_id,
        session.state,
        len(session.transcript),
        len(ai_audio),
        audio_error is not None,
    )

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
        logger.warning(
            "[backend.tts] selected provider failed "
            "provider=%s error=%s; trying=openai",
            type(selected_provider).__name__,
            primary_error,
        )
        fallback_provider = OpenAITTSProvider()

        try:
            return await fallback_provider.synthesize(text), str(primary_error)
        except RuntimeError:
            logger.exception(
                "[backend.tts] fallback provider failed provider=OpenAITTSProvider"
            )
            return b"", str(primary_error)
