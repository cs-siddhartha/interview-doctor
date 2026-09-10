import asyncio
import json
import logging
from time import monotonic

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.realtime.config import (
    UnsupportedRealtimeStackError,
    validate_realtime_stack,
)
from app.realtime.deepgram import DeepgramTurnStream, EmptyTranscriptError
from app.realtime.pipeline import RealtimeTurnPipeline
from app.resumes.context import get_current_question
from app.resumes.dependencies import ResumeStoreDep
from app.schemas.session import (
    SUPPORTED_AUDIO_MIME_TYPES,
    SessionState,
    SessionTransport,
)
from app.security import (
    WebSocketToken,
    is_websocket_origin_allowed,
    validate_websocket_token,
)
from app.stores.dependencies import SessionStoreDep
from app.stores.sessions import (
    SessionStoreConflictError,
    SessionStoreNotFoundError,
)

MAX_REALTIME_FRAME_BYTES = 256 * 1024
MAX_REALTIME_TURN_BYTES = 8 * 1024 * 1024
MAX_REALTIME_TURN_SECONDS = 120
SOCKET_IDLE_TIMEOUT_SECONDS = 300

router = APIRouter(prefix="/sessions", tags=["sessions"])
logger = logging.getLogger("interview_doctor.realtime")


@router.websocket("/{session_id}/stream")
async def stream_session(
    websocket: WebSocket,
    session_id: str,
    session_store: SessionStoreDep,
    resume_store: ResumeStoreDep,
    token: WebSocketToken,
) -> None:
    """Coordinate one realtime browser connection without replacing REST turns."""
    await websocket.accept()
    if not is_websocket_origin_allowed(websocket.headers.get("origin")):
        await websocket.close(code=4403, reason="Realtime origin is not allowed")
        return
    if not validate_websocket_token(session_id, token):
        await websocket.close(code=4401, reason="Invalid realtime access token")
        return
    logger.info("[backend.realtime] socket accepted session_id=%s", session_id)
    session = await session_store.get(session_id)

    if session is None:
        logger.warning("[backend.realtime] session missing session_id=%s", session_id)
        await websocket.close(code=4404, reason="Session not found")
        return

    if session.transport != SessionTransport.WEBSOCKET:
        logger.warning(
            "[backend.realtime] non-realtime session session_id=%s", session_id
        )
        await websocket.close(code=4409, reason="Session is not realtime")
        return

    if session.state == SessionState.SESSION_END:
        logger.warning(
            "[backend.realtime] ended session rejected session_id=%s", session_id
        )
        await websocket.close(code=4409, reason="Session has ended")
        return

    try:
        validate_realtime_stack(session.providers)
    except UnsupportedRealtimeStackError as error:
        logger.warning(
            "[backend.realtime] stack rejected session_id=%s error=%s",
            session_id,
            error,
        )
        await websocket.close(code=4400, reason=str(error))
        return

    pipeline = RealtimeTurnPipeline(
        websocket,
        session_store,
        resume_store,
        session.providers.tts.provider,
    )
    active_turn: DeepgramTurnStream | None = None
    claimed_session = None
    turn_bytes = 0
    turn_started_at = 0.0
    has_started = False

    await websocket.send_json({"type": "session.ready"})
    logger.info("[backend.realtime] session ready session_id=%s", session_id)

    try:
        while True:
            timeout = SOCKET_IDLE_TIMEOUT_SECONDS
            if active_turn is not None:
                timeout = max(
                    0.1,
                    MAX_REALTIME_TURN_SECONDS - (monotonic() - turn_started_at),
                )
            message = await asyncio.wait_for(websocket.receive(), timeout=timeout)

            if message["type"] == "websocket.disconnect":
                logger.info(
                    "[backend.realtime] browser disconnected session_id=%s", session_id
                )
                return

            if audio := message.get("bytes"):
                if active_turn is None:
                    await send_protocol_error(websocket, "No active recording")
                    continue

                if len(audio) > MAX_REALTIME_FRAME_BYTES:
                    await send_protocol_error(websocket, "Audio frame is too large")
                    continue

                turn_bytes += len(audio)
                if turn_bytes > MAX_REALTIME_TURN_BYTES:
                    await active_turn.close()
                    active_turn = None
                    if claimed_session is not None:
                        await pipeline.restore_listening(claimed_session)
                        claimed_session = None
                    await send_protocol_error(websocket, "Audio turn is too large")
                    continue

                await active_turn.send_audio(audio)
                continue

            raw_event = message.get("text")

            if not raw_event:
                continue

            try:
                event = json.loads(raw_event)
            except json.JSONDecodeError:
                logger.warning(
                    "[backend.realtime] invalid event session_id=%s", session_id
                )
                await send_protocol_error(websocket, "Invalid realtime event")
                continue

            if not isinstance(event, dict):
                await send_protocol_error(websocket, "Invalid realtime event")
                continue

            event_type = event.get("type")
            logger.info(
                "[backend.realtime] event received session_id=%s type=%s",
                session_id,
                event_type,
            )

            if event_type == "session.start":
                if not has_started:
                    question = get_current_question(session)

                    if not question:
                        raise RuntimeError("The opening question is unavailable")

                    has_started = True
                    logger.info(
                        "[backend.realtime] opening question session_id=%s", session_id
                    )
                    await pipeline.speak_question(question)
                continue

            if event_type == "interviewer.replay":
                question = get_current_question(session)

                if not question:
                    raise RuntimeError("The interviewer question is unavailable")

                await pipeline.speak_question(question)
                continue

            if event_type == "turn.start":
                if active_turn is not None:
                    await send_protocol_error(
                        websocket,
                        "A recording is already active",
                    )
                    continue

                mime_type = str(event.get("mimeType") or "audio/webm;codecs=opus")
                if mime_type not in SUPPORTED_AUDIO_MIME_TYPES:
                    await send_protocol_error(websocket, "Unsupported audio type")
                    continue

                try:
                    claimed_session = await session_store.claim_turn(
                        session_id,
                        SessionTransport.WEBSOCKET,
                    )
                except SessionStoreNotFoundError:
                    await websocket.close(code=4404, reason="Session not found")
                    return
                except SessionStoreConflictError as error:
                    await send_protocol_error(websocket, str(error))
                    continue

                active_turn = DeepgramTurnStream(
                    lambda text: websocket.send_json(
                        {"type": "stt.partial", "text": text}
                    ),
                    lambda: websocket.send_json({"type": "stt.speech_end"}),
                )
                try:
                    await active_turn.open(mime_type)
                except RuntimeError:
                    await active_turn.close()
                    active_turn = None
                    await pipeline.restore_listening(claimed_session)
                    claimed_session = None
                    raise
                turn_bytes = 0
                turn_started_at = monotonic()
                await websocket.send_json({"type": "turn.started"})
                logger.info(
                    "[backend.realtime] recording started session_id=%s", session_id
                )
                continue

            if event_type == "turn.commit":
                if active_turn is None:
                    await send_protocol_error(websocket, "No active recording")
                    continue

                turn = active_turn
                active_turn = None
                processing_session = claimed_session
                claimed_session = None

                if processing_session is None:
                    await turn.close()
                    await send_protocol_error(websocket, "Turn was not reserved")
                    continue

                try:
                    try:
                        transcript = await turn.finalize()
                    finally:
                        await turn.close()

                    session = await pipeline.process_answer(
                        processing_session,
                        transcript,
                    )
                except EmptyTranscriptError:
                    logger.info(
                        "[backend.realtime] empty turn session_id=%s", session_id
                    )
                    await pipeline.restore_listening(processing_session)
                    await websocket.send_json({"type": "turn.empty"})
                except (
                    RuntimeError,
                    SessionStoreConflictError,
                    SessionStoreNotFoundError,
                ) as error:
                    logger.exception(
                        "[backend.realtime] turn failed session_id=%s",
                        session_id,
                    )
                    await send_protocol_error(websocket, str(error))
                continue

            if event_type == "session.end":
                session = await session_store.end(session_id)
                await websocket.send_json({"type": "session.ended"})
                logger.info(
                    "[backend.realtime] session ended session_id=%s", session_id
                )
                await websocket.close(code=1000)
                return

            await send_protocol_error(websocket, "Unsupported realtime event")
    except TimeoutError:
        logger.info("[backend.realtime] socket timed out session_id=%s", session_id)
        await websocket.close(code=1008, reason="Realtime session timed out")
    except WebSocketDisconnect:
        logger.info("[backend.realtime] socket disconnected session_id=%s", session_id)
        return
    except (
        RuntimeError,
        SessionStoreConflictError,
        SessionStoreNotFoundError,
    ) as error:
        logger.exception(
            "[backend.realtime] socket pipeline failed session_id=%s", session_id
        )
        await send_protocol_error(websocket, str(error))
    finally:
        if active_turn is not None:
            await active_turn.close()
        if claimed_session is not None:
            await pipeline.restore_listening(claimed_session)
        logger.info(
            "[backend.realtime] socket cleanup complete session_id=%s", session_id
        )


async def send_protocol_error(websocket: WebSocket, message: str) -> None:
    """Return recoverable pipeline errors using one stable event shape."""
    logger.warning("[backend.realtime] protocol error message=%s", message)
    await websocket.send_json({"type": "error", "message": message})
