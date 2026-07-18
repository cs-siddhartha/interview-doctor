import asyncio
import os

from app.providers.base import ProviderKind, ProviderMetadata, ProviderTransport
from app.providers.http import post_json_for_bytes
from app.providers.tts.base import TTSProviderBase

CARTESIA_API_URL = "https://api.cartesia.ai/tts/bytes"
CARTESIA_API_KEY_ENV = "CARTESIA_API_KEY"
CARTESIA_MODEL_ENV = "CARTESIA_MODEL_ID"
CARTESIA_VOICE_ID_ENV = "CARTESIA_VOICE_ID"
CARTESIA_VERSION = "2026-03-01"
DEFAULT_CARTESIA_MODEL = "sonic-3"


class CartesiaTTSProvider(TTSProviderBase):
    metadata = ProviderMetadata(
        key="cartesia",
        kind=ProviderKind.TTS,
        display_name="Cartesia",
        transports=frozenset({ProviderTransport.BATCH_HTTP}),
        default_transport=ProviderTransport.BATCH_HTTP,
    )

    def is_configured(self) -> bool:
        return bool(
            os.getenv(CARTESIA_API_KEY_ENV) and os.getenv(CARTESIA_VOICE_ID_ENV)
        )

    async def synthesize(self, text: str) -> bytes:
        if not self.is_configured():
            raise RuntimeError(
                "CARTESIA_API_KEY and CARTESIA_VOICE_ID are required for Cartesia"
            )

        return await asyncio.to_thread(self._synthesize_sync, text)

    def _synthesize_sync(self, text: str) -> bytes:
        return post_json_for_bytes(
            CARTESIA_API_URL,
            {
                "model_id": os.getenv(CARTESIA_MODEL_ENV, DEFAULT_CARTESIA_MODEL),
                "transcript": text,
                "voice": {"id": os.environ[CARTESIA_VOICE_ID_ENV]},
                "output_format": {
                    "container": "wav",
                    "encoding": "pcm_s16le",
                    "sample_rate": 24000,
                },
            },
            headers={
                "Authorization": f"Bearer {os.environ[CARTESIA_API_KEY_ENV]}",
                "Cartesia-Version": CARTESIA_VERSION,
            },
        )
