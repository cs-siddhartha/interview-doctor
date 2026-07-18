import asyncio
import os
from typing import Any

from app.providers.base import ProviderKind, ProviderMetadata, ProviderTransport
from app.providers.http import post_multipart_for_json
from app.providers.stt.base import STTProviderBase

OPENAI_TRANSCRIPTION_API_URL = "https://api.openai.com/v1/audio/transcriptions"
OPENAI_API_KEY_ENV = "OPENAI_API_KEY"
OPENAI_TRANSCRIPTION_MODEL_ENV = "OPENAI_TRANSCRIPTION_MODEL"
DEFAULT_OPENAI_TRANSCRIPTION_MODEL = "whisper-1"
TRANSCRIPTION_FILE_EXTENSIONS = {
    "audio/mp4": "mp4",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/webm": "webm",
    "audio/webm;codecs=opus": "webm",
}


class WhisperSTTProvider(STTProviderBase):
    metadata = ProviderMetadata(
        key="whisper",
        kind=ProviderKind.STT,
        display_name="Whisper",
        transports=frozenset({ProviderTransport.BATCH_HTTP}),
        default_transport=ProviderTransport.BATCH_HTTP,
    )

    def is_configured(self) -> bool:
        return bool(os.getenv(OPENAI_API_KEY_ENV))

    async def transcribe(self, audio: bytes, mime_type: str) -> str:
        if not self.is_configured():
            raise RuntimeError("OPENAI_API_KEY is required for Whisper provider")

        payload = await asyncio.to_thread(self._transcribe_sync, audio, mime_type)

        return extract_whisper_transcript(payload)

    def _transcribe_sync(self, audio: bytes, mime_type: str) -> dict[str, Any]:
        return post_multipart_for_json(
            OPENAI_TRANSCRIPTION_API_URL,
            fields={
                "model": os.getenv(
                    OPENAI_TRANSCRIPTION_MODEL_ENV,
                    DEFAULT_OPENAI_TRANSCRIPTION_MODEL,
                )
            },
            file_field="file",
            filename=f"interview-turn.{get_transcription_file_extension(mime_type)}",
            file_content=audio,
            file_content_type=mime_type,
            headers={"Authorization": f"Bearer {os.environ[OPENAI_API_KEY_ENV]}"},
        )


def get_transcription_file_extension(mime_type: str) -> str:
    return TRANSCRIPTION_FILE_EXTENSIONS.get(mime_type, "webm")


def extract_whisper_transcript(payload: dict[str, Any]) -> str:
    transcript = payload.get("text")

    if isinstance(transcript, str) and transcript:
        return transcript

    raise RuntimeError("Whisper response did not include text")
