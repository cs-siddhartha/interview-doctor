import asyncio
import os
import urllib.parse

from app.providers.base import ProviderKind, ProviderMetadata, ProviderTransport
from app.providers.http import post_json_for_bytes
from app.providers.tts.base import TTSProviderBase

ELEVENLABS_API_BASE_URL = "https://api.elevenlabs.io/v1/text-to-speech"
ELEVENLABS_API_KEY_ENV = "ELEVENLABS_API_KEY"
ELEVENLABS_VOICE_ID_ENV = "ELEVENLABS_VOICE_ID"
ELEVENLABS_MODEL_ENV = "ELEVENLABS_MODEL_ID"
ELEVENLABS_OUTPUT_FORMAT_ENV = "ELEVENLABS_OUTPUT_FORMAT"
DEFAULT_ELEVENLABS_MODEL = "eleven_multilingual_v2"
DEFAULT_ELEVENLABS_OUTPUT_FORMAT = "mp3_44100_128"


class ElevenLabsTTSProvider(TTSProviderBase):
    metadata = ProviderMetadata(
        key="elevenlabs",
        kind=ProviderKind.TTS,
        display_name="ElevenLabs",
        is_mock=False,
        transports=frozenset({ProviderTransport.BATCH_HTTP}),
        default_transport=ProviderTransport.BATCH_HTTP,
    )

    def is_configured(self) -> bool:
        return bool(
            os.getenv(ELEVENLABS_API_KEY_ENV) and os.getenv(ELEVENLABS_VOICE_ID_ENV)
        )

    async def synthesize(self, text: str) -> bytes:
        if not self.is_configured():
            raise RuntimeError(
                "ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID are required for ElevenLabs"
            )

        return await asyncio.to_thread(self._synthesize_sync, text)

    def _synthesize_sync(self, text: str) -> bytes:
        voice_id = urllib.parse.quote(os.environ[ELEVENLABS_VOICE_ID_ENV], safe="")
        output_format = urllib.parse.quote(
            os.getenv(ELEVENLABS_OUTPUT_FORMAT_ENV, DEFAULT_ELEVENLABS_OUTPUT_FORMAT),
            safe="",
        )

        return post_json_for_bytes(
            f"{ELEVENLABS_API_BASE_URL}/{voice_id}?output_format={output_format}",
            {
                "text": text,
                "model_id": os.getenv(ELEVENLABS_MODEL_ENV, DEFAULT_ELEVENLABS_MODEL),
            },
            headers={"xi-api-key": os.environ[ELEVENLABS_API_KEY_ENV]},
        )
