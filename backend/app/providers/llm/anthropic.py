import asyncio
import json
import os
from typing import Any

from app.providers.base import ProviderKind, ProviderMetadata, ProviderTransport
from app.providers.http import post_json
from app.providers.llm.base import LLMProviderBase

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_API_KEY_ENV = "ANTHROPIC_API_KEY"
ANTHROPIC_MODEL_ENV = "ANTHROPIC_MODEL"
ANTHROPIC_VERSION = "2023-06-01"
DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-5"


class AnthropicLLMProvider(LLMProviderBase):
    metadata = ProviderMetadata(
        key="anthropic",
        kind=ProviderKind.LLM,
        display_name="Anthropic",
        is_mock=False,
        transports=frozenset({ProviderTransport.BATCH_HTTP}),
        default_transport=ProviderTransport.BATCH_HTTP,
    )

    def is_configured(self) -> bool:
        return bool(os.getenv(ANTHROPIC_API_KEY_ENV))

    async def generate_response(self, prompt: str, context: dict) -> str:
        if not self.is_configured():
            raise RuntimeError("ANTHROPIC_API_KEY is required for Anthropic provider")

        return await asyncio.to_thread(self._generate_response_sync, prompt, context)


    def _generate_response_sync(self, prompt: str, context: dict) -> str:
        payload = post_json(
            ANTHROPIC_API_URL,
            {
                "model": os.getenv(ANTHROPIC_MODEL_ENV, DEFAULT_ANTHROPIC_MODEL),
                "max_tokens": 256,
                "system": (
                    "You are Interview Doctor, a direct AI interviewer. Ask one "
                    "focused follow-up question. Keep it concise."
                ),
                "messages": [
                    {
                        "role": "user",
                        "content": json.dumps(
                            {
                                "candidate_answer": prompt,
                                "session": {
                                    "mode": context.get("mode"),
                                    "setup": context.get("setup"),
                                    "transcript": context.get("transcript", []),
                                },
                            }
                        ),
                    }
                ],
            },
            headers={
                "x-api-key": os.environ[ANTHROPIC_API_KEY_ENV],
                "anthropic-version": ANTHROPIC_VERSION,
            },
        )

        return extract_anthropic_text(payload)


def extract_anthropic_text(payload: dict[str, Any]) -> str:
    for content in payload.get("content", []):
        text = content.get("text")

        if isinstance(text, str) and text:
            return text

    raise RuntimeError("Anthropic response did not include text")
