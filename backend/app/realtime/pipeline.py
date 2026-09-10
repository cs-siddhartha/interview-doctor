import logging
from datetime import UTC, datetime

from fastapi import WebSocket

from app.providers.registry import build_provider_stack
from app.realtime.elevenlabs import ElevenLabsStreamingSynthesizer
from app.realtime.openai_tts import OpenAIStreamingSynthesizer
from app.resumes.context import get_current_question, get_resume_evidence
from app.schemas.session import (
    Session,
    SessionState,
    TranscriptSpeaker,
    TranscriptTurn,
    TTSProvider,
)
from app.stores.resumes import ResumeStore
from app.stores.sessions import (
    SessionStore,
    SessionStoreConflictError,
    SessionStoreNotFoundError,
)

REALTIME_AUDIO_SAMPLE_RATE = 24000
logger = logging.getLogger("interview_doctor.realtime.pipeline")


class RealtimeTurnPipeline:
    """Run shared interview reasoning while emitting realtime socket events."""

    def __init__(
        self,
        websocket: WebSocket,
        session_store: SessionStore,
        resume_store: ResumeStore,
        tts_provider: TTSProvider,
    ) -> None:
        self.websocket = websocket
        self.session_store = session_store
        self.resume_store = resume_store
        self.tts = (
            OpenAIStreamingSynthesizer()
            if tts_provider == TTSProvider.OPENAI
            else ElevenLabsStreamingSynthesizer()
        )

    async def speak_question(self, text: str) -> None:
        """Send question text and progressively deliver its PCM audio."""
        logger.info(
            "[backend.realtime.tts] streaming started chars=%d provider=%s",
            len(text),
            type(self.tts).__name__,
        )
        await self.websocket.send_json({"type": "interviewer.text", "text": text})
        await self.websocket.send_json(
            {
                "type": "interviewer.audio.start",
                "sampleRate": REALTIME_AUDIO_SAMPLE_RATE,
            }
        )

        try:
            await self.tts.stream(text, self.websocket.send_bytes)
        except RuntimeError as error:
            logger.exception("[backend.realtime.tts] streaming failed")
            await self.websocket.send_json(
                {
                    "type": "interviewer.audio.error",
                    "message": str(error),
                }
            )
        finally:
            await self.websocket.send_json({"type": "interviewer.audio.end"})
            logger.info("[backend.realtime.tts] streaming ended")

    async def process_answer(self, session: Session, transcript: str) -> Session:
        """Generate, persist, and stream the next interview turn."""
        logger.info(
            "[backend.realtime.turn] processing session_id=%s transcript_chars=%d",
            session.id,
            len(transcript),
        )
        current = session

        try:
            current = await self.session_store.transition(
                current.id,
                current.version,
                SessionState.LLM_THINKING,
            )
            await self.websocket.send_json({"type": "stt.final", "text": transcript})

            provider_stack = build_provider_stack(current.providers)
            resume_evidence = await get_resume_evidence(
                current.mode,
                current.setup,
                self.resume_store,
                candidate_answer=transcript,
                current_question=get_current_question(current),
            )
            context = current.model_dump(mode="json")
            context["resume_evidence"] = resume_evidence
            ai_text = await provider_stack.llm.generate_response(
                candidate_answer=transcript,
                context=context,
            )
            logger.info(
                "[backend.realtime.turn] response generated "
                "session_id=%s response_chars=%d",
                current.id,
                len(ai_text),
            )
            now = datetime.now(UTC)
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

            current = await self.session_store.complete_turn(
                current.id,
                current.version,
                candidate_turn,
                ai_turn,
                SessionState.AI_SPEAKING,
            )
            await self.speak_question(ai_text)
            current = await self.session_store.transition(
                current.id,
                current.version,
                SessionState.LISTENING,
            )
            await self.websocket.send_json(
                {
                    "type": "turn.completed",
                    "candidateTurn": candidate_turn.model_dump(mode="json"),
                    "aiTurn": ai_turn.model_dump(mode="json"),
                    "state": current.state,
                }
            )
        except (RuntimeError, SessionStoreConflictError, SessionStoreNotFoundError):
            await self.restore_listening(current)
            raise

        logger.info(
            "[backend.realtime.turn] completed session_id=%s transcript_turns=%d",
            current.id,
            len(current.transcript),
        )
        return current

    async def restore_listening(self, session: Session) -> None:
        """Release a realtime turn unless another writer ended or replaced it."""
        try:
            await self.session_store.transition(
                session.id,
                session.version,
                SessionState.LISTENING,
            )
        except (SessionStoreConflictError, SessionStoreNotFoundError):
            logger.warning(
                "[backend.realtime.turn] could not restore session_id=%s",
                session.id,
            )
