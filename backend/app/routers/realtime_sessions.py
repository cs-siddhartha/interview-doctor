import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.realtime.config import (
    UnsupportedRealtimeStackError,
    validate_realtime_stack,
)
from app.realtime.deepgram import DeepgramTurnStream, EmptyTranscriptError
from app.realtime.pipeline import RealtimeTurnPipeline
from app.resumes.context import get_current_question
from app.resumes.dependencies import ResumeStoreDep
from app.schemas.session import SessionState, SessionTransport
from app.stores.dependencies import SessionStoreDep

router = APIRouter(prefix="/sessions", tags=["sessions"])
logger = logging.getLogger("interview_doctor.realtime")


@router.websocket("/{session_id}/stream")
async def stream_session(
    websocket: WebSocket,
    session_id: str,
    session_store: SessionStoreDep,
    resume_store: ResumeStoreDep,
) -> None:
    """Coordinate one realtime browser connection without replacing REST turns."""
    await websocket.accept()
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
    has_started = False

    await websocket.send_json({"type": "session.ready"})
    logger.info("[backend.realtime] session ready session_id=%s", session_id)

    try:
        while True:
            message = await websocket.receive()

            if message["type"] == "websocket.disconnect":
                logger.info(
                    "[backend.realtime] browser disconnected session_id=%s", session_id
                )
                return

            if audio := message.get("bytes"):
                if active_turn is None:
                    await send_protocol_error(websocket, "No active recording")
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

                active_turn = DeepgramTurnStream(
                    lambda text: websocket.send_json(
                        {"type": "stt.partial", "text": text}
                    ),
                    lambda: websocket.send_json({"type": "stt.speech_end"}),
                )
                await active_turn.open(
                    str(event.get("mimeType") or "audio/webm;codecs=opus")
                )
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

                try:
                    try:
                        transcript = await turn.finalize()
                    finally:
                        await turn.close()

                    await pipeline.process_answer(session, transcript)
                except EmptyTranscriptError:
                    logger.info(
                        "[backend.realtime] empty turn session_id=%s", session_id
                    )
                    session.state = SessionState.LISTENING
                    await session_store.save(session)
                    await websocket.send_json({"type": "turn.empty"})
                except RuntimeError as error:
                    logger.exception(
                        "[backend.realtime] turn failed session_id=%s",
                        session_id,
                    )
                    session.state = SessionState.LISTENING
                    await session_store.save(session)
                    await send_protocol_error(websocket, str(error))
                continue

            if event_type == "session.end":
                session.state = SessionState.SESSION_END
                await session_store.save(session)
                await websocket.send_json({"type": "session.ended"})
                logger.info(
                    "[backend.realtime] session ended session_id=%s", session_id
                )
                await websocket.close(code=1000)
                return

            await send_protocol_error(websocket, "Unsupported realtime event")
    except WebSocketDisconnect:
        logger.info("[backend.realtime] socket disconnected session_id=%s", session_id)
        return
    except RuntimeError as error:
        logger.exception(
            "[backend.realtime] socket pipeline failed session_id=%s", session_id
        )
        session.state = SessionState.LISTENING
        await session_store.save(session)
        await send_protocol_error(websocket, str(error))
    finally:
        if active_turn is not None:
            await active_turn.close()
        logger.info(
            "[backend.realtime] socket cleanup complete session_id=%s", session_id
        )


async def send_protocol_error(websocket: WebSocket, message: str) -> None:
    """Return recoverable pipeline errors using one stable event shape."""
    logger.warning("[backend.realtime] protocol error message=%s", message)
    await websocket.send_json({"type": "error", "message": message})
