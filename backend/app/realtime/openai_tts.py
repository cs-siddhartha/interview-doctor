import asyncio
import json
import os
import urllib.error
import urllib.request
from collections.abc import Awaitable, Callable

from app.providers.tts.openai import (
    DEFAULT_OPENAI_TTS_MODEL,
    DEFAULT_OPENAI_TTS_VOICE,
    OPENAI_API_KEY_ENV,
    OPENAI_SPEECH_API_URL,
    OPENAI_TTS_MODEL_ENV,
    OPENAI_TTS_VOICE_ENV,
)

OPENAI_TTS_STREAM_CHUNK_BYTES = 4096
OPENAI_TTS_TIMEOUT_SECONDS = 30

AudioCallback = Callable[[bytes], Awaitable[None]]


class OpenAIStreamingSynthesizer:
    """Stream OpenAI's raw 24 kHz PCM response to the browser player."""

    async def stream(self, text: str, on_audio: AudioCallback) -> None:
        api_key = os.getenv(OPENAI_API_KEY_ENV)

        if not api_key:
            raise RuntimeError("OPENAI_API_KEY is required for realtime TTS")

        request = urllib.request.Request(
            OPENAI_SPEECH_API_URL,
            data=json.dumps(
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
                    "response_format": "pcm",
                    "stream_format": "audio",
                }
            ).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            response = await asyncio.to_thread(
                urllib.request.urlopen,
                request,
                None,
                OPENAI_TTS_TIMEOUT_SECONDS,
            )
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8")
            raise RuntimeError(f"OpenAI TTS request failed: {detail}") from error

        try:
            while chunk := await asyncio.to_thread(
                response.read,
                OPENAI_TTS_STREAM_CHUNK_BYTES,
            ):
                await on_audio(chunk)
        finally:
            response.close()
