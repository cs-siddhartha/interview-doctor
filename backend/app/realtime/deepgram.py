import asyncio
import json
import logging
import os
import urllib.parse
from collections.abc import Awaitable, Callable
from typing import Any

from websockets.asyncio.client import ClientConnection, connect
from websockets.exceptions import ConnectionClosed

from app.providers.stt.deepgram import (
    DEEPGRAM_API_KEY_ENV,
    DEEPGRAM_MODEL_ENV,
    DEFAULT_DEEPGRAM_MODEL,
)

DEEPGRAM_STREAM_URL = "wss://api.deepgram.com/v1/listen"
DEEPGRAM_FINALIZE_TIMEOUT_SECONDS = 15
DEEPGRAM_FINALIZE_GRACE_SECONDS = 0.75
logger = logging.getLogger("interview_doctor.realtime.deepgram")

TranscriptCallback = Callable[[str], Awaitable[None]]
SpeechEndCallback = Callable[[], Awaitable[None]]


class EmptyTranscriptError(RuntimeError):
    """Identify a completed stream that contained no recognized speech."""


class DeepgramTurnStream:
    """Stream one browser answer to Deepgram and expose partial/final text."""

    def __init__(
        self,
        on_partial: TranscriptCallback,
        on_speech_end: SpeechEndCallback,
    ) -> None:
        self.on_partial = on_partial
        self.on_speech_end = on_speech_end
        self.socket: ClientConnection | None = None
        self.reader_task: asyncio.Task[None] | None = None
        self.final_transcript = asyncio.get_running_loop().create_future()
        self.final_parts: list[str] = []
        self.speech_end_notified = False
        self.is_finalizing = False

    async def open(self, mime_type: str) -> None:
        """Open an authenticated provider socket before microphone chunks arrive."""
        api_key = os.getenv(DEEPGRAM_API_KEY_ENV)

        if not api_key:
            logger.error("[backend.realtime.stt] missing API key")
            raise RuntimeError("DEEPGRAM_API_KEY is required for realtime STT")

        params = urllib.parse.urlencode(
            {
                "model": os.getenv(DEEPGRAM_MODEL_ENV, DEFAULT_DEEPGRAM_MODEL),
                "smart_format": "true",
                "interim_results": "true",
                "punctuate": "true",
                "vad_events": "true",
                "endpointing": "1200",
                "utterance_end_ms": "1500",
            }
        )
        self.socket = await connect(
            f"{DEEPGRAM_STREAM_URL}?{params}",
            additional_headers={
                "Authorization": f"Token {api_key}",
                "Content-Type": mime_type,
            },
        )
        self.reader_task = asyncio.create_task(self._read_messages())
        logger.info(
            "[backend.realtime.stt] stream opened model=%s mime_type=%s",
            os.getenv(DEEPGRAM_MODEL_ENV, DEFAULT_DEEPGRAM_MODEL),
            mime_type,
        )

    async def send_audio(self, audio: bytes) -> None:
        """Forward a browser MediaRecorder chunk without base64 expansion."""
        if self.socket is None:
            raise RuntimeError("Realtime STT stream has not started")

        await self.socket.send(audio)

    async def finalize(self) -> str:
        """Flush the provider buffer and wait for the complete candidate answer."""
        if self.socket is None:
            raise RuntimeError("Realtime STT stream has not started")

        self.is_finalizing = True
        logger.info("[backend.realtime.stt] finalizing stream")
        await self.socket.send(json.dumps({"type": "Finalize"}))

        try:
            transcript = await asyncio.wait_for(
                asyncio.shield(self.final_transcript),
                timeout=DEEPGRAM_FINALIZE_GRACE_SECONDS,
            )
        except TimeoutError:
            if self.final_parts:
                transcript = " ".join(self.final_parts).strip()
            else:
                try:
                    transcript = await asyncio.wait_for(
                        self.final_transcript,
                        timeout=(
                            DEEPGRAM_FINALIZE_TIMEOUT_SECONDS
                            - DEEPGRAM_FINALIZE_GRACE_SECONDS
                        ),
                    )
                except TimeoutError as error:
                    raise RuntimeError(
                        "Deepgram did not finalize the transcript"
                    ) from error

        if not transcript:
            logger.info("[backend.realtime.stt] finalized with empty transcript")
            raise EmptyTranscriptError

        logger.info(
            "[backend.realtime.stt] finalized transcript_chars=%d",
            len(transcript),
        )
        return transcript

    async def close(self) -> None:
        """Release provider socket and reader resources after each answer."""
        if self.socket is not None:
            await self.socket.close()
            self.socket = None

        if self.reader_task is not None:
            await asyncio.gather(self.reader_task, return_exceptions=True)
            self.reader_task = None

        if not self.final_transcript.done():
            self.final_transcript.cancel()
        elif not self.final_transcript.cancelled():
            self.final_transcript.exception()
        logger.info("[backend.realtime.stt] stream closed")

    async def _read_messages(self) -> None:
        """Normalize Deepgram result events into partial and final transcripts."""
        if self.socket is None:
            return

        try:
            async for raw_message in self.socket:
                if not isinstance(raw_message, str):
                    continue

                payload = json.loads(raw_message)

                event_type = payload.get("type")

                if event_type == "UtteranceEnd":
                    await self._notify_speech_end()
                    continue

                if event_type != "Results":
                    continue

                transcript = extract_deepgram_stream_text(payload)

                if transcript:
                    if payload.get("is_final") or payload.get("speech_final"):
                        self.final_parts.append(transcript)
                    else:
                        await self.on_partial(transcript)

                if payload.get("from_finalize"):
                    self._resolve_final_transcript()

                if payload.get("speech_final") and self.final_parts:
                    await self._notify_speech_end()
        except ConnectionClosed:
            if not self.final_transcript.done():
                if self.is_finalizing:
                    self._resolve_final_transcript()
                else:
                    self.final_transcript.set_exception(
                        RuntimeError("Deepgram realtime connection closed unexpectedly")
                    )
        except json.JSONDecodeError:
            if not self.final_transcript.done():
                self.final_transcript.set_exception(
                    RuntimeError("Deepgram returned an invalid streaming event")
                )
        finally:
            if not self.final_transcript.done() and (
                self.final_parts or self.is_finalizing
            ):
                self._resolve_final_transcript()

    def _resolve_final_transcript(self) -> None:
        """Complete the pending turn exactly once from accumulated final segments."""
        if not self.final_transcript.done():
            self.final_transcript.set_result(" ".join(self.final_parts).strip())

    async def _notify_speech_end(self) -> None:
        """Emit one endpoint only after Deepgram has recognized speech."""
        if self.speech_end_notified or not self.final_parts:
            return

        self.speech_end_notified = True
        await self.on_speech_end()


def extract_deepgram_stream_text(payload: dict[str, Any]) -> str:
    """Read the first transcript alternative from a streaming result event."""
    alternatives = payload.get("channel", {}).get("alternatives", [])

    if not alternatives:
        return ""

    transcript = alternatives[0].get("transcript")

    return transcript.strip() if isinstance(transcript, str) else ""
