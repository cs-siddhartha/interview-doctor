import asyncio
import os

from app.providers.base import ProviderKind, ProviderMetadata, ProviderTransport
from app.providers.http import post_json_for_bytes
from app.providers.tts.base import TTSProviderBase

OPENAI_SPEECH_API_URL = "https://api.openai.com/v1/audio/speech"
OPENAI_API_KEY_ENV = "OPENAI_API_KEY"
OPENAI_TTS_MODEL_ENV = "OPENAI_TTS_MODEL"
OPENAI_TTS_VOICE_ENV = "OPENAI_TTS_VOICE"
DEFAULT_OPENAI_TTS_MODEL = "tts-1"
DEFAULT_OPENAI_TTS_VOICE = "alloy"


class OpenAITTSProvider(TTSProviderBase):
    metadata = ProviderMetadata(
        key="openai-fallback",
        kind=ProviderKind.TTS,
        display_name="OpenAI fallback",
        transports=frozenset({ProviderTransport.BATCH_HTTP}),
        default_transport=ProviderTransport.BATCH_HTTP,
    )

    def is_configured(self) -> bool:
        return bool(os.getenv(OPENAI_API_KEY_ENV))

    async def synthesize(self, text: str) -> bytes:
        if not self.is_configured():
            raise RuntimeError("OPENAI_API_KEY is required for OpenAI TTS fallback")

        return await asyncio.to_thread(self._synthesize_sync, text)

    def _synthesize_sync(self, text: str) -> bytes:
        return post_json_for_bytes(
            OPENAI_SPEECH_API_URL,
            {
                "model": os.getenv(
                    OPENAI_TTS_MODEL_ENV,
                    DEFAULT_OPENAI_TTS_MODEL,
                ),
                "input": text,
                "voice": os.getenv(
                    OPENAI_TTS_VOICE_ENV,
                    DEFAULT_OPENAI_TTS_VOICE,
                ),
                "response_format": "mp3",
            },
            headers={
                "Authorization": f"Bearer {os.environ[OPENAI_API_KEY_ENV]}"
            },
        )
