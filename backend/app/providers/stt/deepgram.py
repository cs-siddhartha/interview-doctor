import asyncio
import os
from typing import Any

from app.providers.base import ProviderKind, ProviderMetadata, ProviderTransport
from app.providers.http import post_bytes_for_json
from app.providers.stt.base import STTProviderBase

DEEPGRAM_API_URL = "https://api.deepgram.com/v1/listen"
DEEPGRAM_API_KEY_ENV = "DEEPGRAM_API_KEY"
DEEPGRAM_MODEL_ENV = "DEEPGRAM_MODEL"
DEFAULT_DEEPGRAM_MODEL = "nova-3"


class DeepgramSTTProvider(STTProviderBase):
    metadata = ProviderMetadata(
        key="deepgram",
        kind=ProviderKind.STT,
        display_name="Deepgram",
        is_mock=False,
        transports=frozenset({ProviderTransport.BATCH_HTTP}),
        default_transport=ProviderTransport.BATCH_HTTP,
    )

    def is_configured(self) -> bool:
        return bool(os.getenv(DEEPGRAM_API_KEY_ENV))

    async def transcribe(self, audio: bytes, mime_type: str) -> str:
        if not self.is_configured():
            raise RuntimeError("DEEPGRAM_API_KEY is required for Deepgram provider")

        payload = await asyncio.to_thread(self._transcribe_sync, audio, mime_type)

        return extract_deepgram_transcript(payload)


    def _transcribe_sync(self, audio: bytes, mime_type: str) -> dict[str, Any]:
        return post_bytes_for_json(
            DEEPGRAM_API_URL,
            audio,
            headers={"Authorization": f"Token {os.environ[DEEPGRAM_API_KEY_ENV]}"},
            content_type=mime_type,
            params={
                "model": os.getenv(DEEPGRAM_MODEL_ENV, DEFAULT_DEEPGRAM_MODEL),
                "smart_format": "true",
            },
        )


def extract_deepgram_transcript(payload: dict[str, Any]) -> str:
    channels = payload.get("results", {}).get("channels", [])

    if not channels:
        raise RuntimeError("Deepgram response did not include channels")

    alternatives = channels[0].get("alternatives", [])

    if not alternatives:
        raise RuntimeError("Deepgram response did not include alternatives")

    transcript = alternatives[0].get("transcript")

    if isinstance(transcript, str) and transcript:
        return transcript

    raise RuntimeError("Deepgram response did not include transcript text")
