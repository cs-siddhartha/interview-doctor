import base64
import json
import os
import urllib.parse
from collections.abc import Awaitable, Callable

from websockets.asyncio.client import connect

from app.providers.tts.elevenlabs import (
    DEFAULT_ELEVENLABS_MODEL,
    ELEVENLABS_API_KEY_ENV,
    ELEVENLABS_MODEL_ENV,
    ELEVENLABS_VOICE_ID_ENV,
)

ELEVENLABS_STREAM_URL = "wss://api.elevenlabs.io/v1/text-to-speech"
ELEVENLABS_STREAM_OUTPUT_FORMAT = "pcm_24000"

AudioCallback = Callable[[bytes], Awaitable[None]]


class ElevenLabsStreamingSynthesizer:
    """Stream raw PCM interviewer audio from ElevenLabs to the browser."""

    async def stream(self, text: str, on_audio: AudioCallback) -> None:
        """Generate one utterance and forward audio chunks as they arrive."""
        api_key = os.getenv(ELEVENLABS_API_KEY_ENV)
        voice_id = os.getenv(ELEVENLABS_VOICE_ID_ENV)

        if not api_key or not voice_id:
            raise RuntimeError(
                "ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID are required for "
                "realtime TTS"
            )

        params = urllib.parse.urlencode(
            {
                "model_id": os.getenv(
                    ELEVENLABS_MODEL_ENV,
                    DEFAULT_ELEVENLABS_MODEL,
                ),
                "output_format": ELEVENLABS_STREAM_OUTPUT_FORMAT,
            }
        )
        safe_voice_id = urllib.parse.quote(voice_id, safe="")
        url = f"{ELEVENLABS_STREAM_URL}/{safe_voice_id}/stream-input?{params}"

        async with connect(
            url,
            additional_headers={"xi-api-key": api_key},
        ) as socket:
            await socket.send(json.dumps({"text": " "}))
            await socket.send(json.dumps({"text": f"{text.strip()} "}))
            await socket.send(json.dumps({"text": ""}))

            async for raw_message in socket:
                if not isinstance(raw_message, str):
                    continue

                payload = json.loads(raw_message)
                audio = payload.get("audio")

                if isinstance(audio, str) and audio:
                    await on_audio(base64.b64decode(audio))

                if payload.get("isFinal") or payload.get("is_final"):
                    return
