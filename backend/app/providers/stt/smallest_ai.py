import asyncio
import os
from typing import Any

from app.providers.base import ProviderKind, ProviderMetadata, ProviderTransport
from app.providers.http import post_bytes_for_json
from app.providers.stt.base import STTProviderBase

SMALLEST_STT_API_URL = "https://api.smallest.ai/waves/v1/stt/"
SMALLEST_API_KEY_ENV = "SMALLEST_API_KEY"
SMALLEST_STT_MODEL_ENV = "SMALLEST_STT_MODEL"
SMALLEST_STT_LANGUAGE_ENV = "SMALLEST_STT_LANGUAGE"
DEFAULT_SMALLEST_STT_MODEL = "pulse"
DEFAULT_SMALLEST_STT_LANGUAGE = "en"


class SmallestAISTTProvider(STTProviderBase):
    metadata = ProviderMetadata(
        key="smallest-ai",
        kind=ProviderKind.STT,
        display_name="Smallest AI",
        is_mock=False,
        transports=frozenset({ProviderTransport.BATCH_HTTP}),
        default_transport=ProviderTransport.BATCH_HTTP,
    )

    def is_configured(self) -> bool:
        return bool(os.getenv(SMALLEST_API_KEY_ENV))

    async def transcribe(self, audio: bytes, mime_type: str) -> str:
        if not self.is_configured():
            raise RuntimeError("SMALLEST_API_KEY is required for Smallest AI provider")

        payload = await asyncio.to_thread(self._transcribe_sync, audio, mime_type)

        return extract_smallest_transcript(payload)

    def _transcribe_sync(self, audio: bytes, mime_type: str) -> dict[str, Any]:
        return post_bytes_for_json(
            SMALLEST_STT_API_URL,
            audio,
            headers={"Authorization": f"Bearer {os.environ[SMALLEST_API_KEY_ENV]}"},
            content_type=mime_type,
            params={
                "model": os.getenv(SMALLEST_STT_MODEL_ENV, DEFAULT_SMALLEST_STT_MODEL),
                "language": os.getenv(
                    SMALLEST_STT_LANGUAGE_ENV,
                    DEFAULT_SMALLEST_STT_LANGUAGE,
                ),
            },
        )


# Normalizes Smallest AI's transcription response into the shared STT string
# expected by the session turn pipeline.
def extract_smallest_transcript(payload: dict[str, Any]) -> str:
    transcript = payload.get("transcription")

    if isinstance(transcript, str) and transcript:
        return transcript

    raise RuntimeError("Smallest AI response did not include transcription text")
