import asyncio
import os

from app.providers.base import ProviderKind, ProviderMetadata, ProviderTransport
from app.providers.http import post_json_for_bytes
from app.providers.tts.base import TTSProviderBase

SMALLEST_TTS_API_URL = "https://api.smallest.ai/waves/v1/lightning-v3.1/get_speech"
SMALLEST_API_KEY_ENV = "SMALLEST_API_KEY"
SMALLEST_TTS_VOICE_ID_ENV = "SMALLEST_TTS_VOICE_ID"
SMALLEST_TTS_SAMPLE_RATE_ENV = "SMALLEST_TTS_SAMPLE_RATE"
SMALLEST_TTS_LANGUAGE_ENV = "SMALLEST_TTS_LANGUAGE"
DEFAULT_SMALLEST_TTS_VOICE_ID = "magnus"
DEFAULT_SMALLEST_TTS_SAMPLE_RATE = "24000"
DEFAULT_SMALLEST_TTS_LANGUAGE = "en"


class SmallestAITTSProvider(TTSProviderBase):
    metadata = ProviderMetadata(
        key="smallest-ai",
        kind=ProviderKind.TTS,
        display_name="Smallest AI",
        is_mock=False,
        transports=frozenset({ProviderTransport.BATCH_HTTP}),
        default_transport=ProviderTransport.BATCH_HTTP,
    )

    def is_configured(self) -> bool:
        return bool(os.getenv(SMALLEST_API_KEY_ENV))

    async def synthesize(self, text: str) -> bytes:
        if not self.is_configured():
            raise RuntimeError("SMALLEST_API_KEY is required for Smallest AI provider")

        return await asyncio.to_thread(self._synthesize_sync, text)

    def _synthesize_sync(self, text: str) -> bytes:
        return post_json_for_bytes(
            SMALLEST_TTS_API_URL,
            {
                "text": text,
                "voice_id": os.getenv(
                    SMALLEST_TTS_VOICE_ID_ENV,
                    DEFAULT_SMALLEST_TTS_VOICE_ID,
                ),
                "sample_rate": int(
                    os.getenv(
                        SMALLEST_TTS_SAMPLE_RATE_ENV,
                        DEFAULT_SMALLEST_TTS_SAMPLE_RATE,
                    )
                ),
                "speed": 1.0,
                "language": os.getenv(
                    SMALLEST_TTS_LANGUAGE_ENV,
                    DEFAULT_SMALLEST_TTS_LANGUAGE,
                ),
                "output_format": "wav",
            },
            headers={"Authorization": f"Bearer {os.environ[SMALLEST_API_KEY_ENV]}"},
        )
