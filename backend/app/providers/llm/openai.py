import asyncio
import os
from typing import Any

from app.providers.base import ProviderKind, ProviderMetadata, ProviderTransport
from app.providers.http import post_json
from app.providers.llm.base import LLMProviderBase
from app.providers.llm.prompts import (
    INTERVIEWER_SYSTEM_PROMPT,
    build_interviewer_context,
)

OPENAI_API_URL = "https://api.openai.com/v1/responses"
OPENAI_API_KEY_ENV = "OPENAI_API_KEY"
OPENAI_MODEL_ENV = "OPENAI_MODEL"
DEFAULT_OPENAI_MODEL = "gpt-5"


class OpenAILLMProvider(LLMProviderBase):
    metadata = ProviderMetadata(
        key="openai",
        kind=ProviderKind.LLM,
        display_name="OpenAI",
        transports=frozenset({ProviderTransport.BATCH_HTTP}),
        default_transport=ProviderTransport.BATCH_HTTP,
    )

    def is_configured(self) -> bool:
        return bool(os.getenv(OPENAI_API_KEY_ENV))

    async def generate_response(
        self,
        candidate_answer: str | None,
        context: dict,
    ) -> str:
        if not self.is_configured():
            raise RuntimeError("OPENAI_API_KEY is required for OpenAI provider")

        return await asyncio.to_thread(
            self._generate_response_sync,
            candidate_answer,
            context,
        )

    def _generate_response_sync(
        self,
        candidate_answer: str | None,
        context: dict,
    ) -> str:
        payload = post_json(
            OPENAI_API_URL,
            {
                "model": os.getenv(OPENAI_MODEL_ENV, DEFAULT_OPENAI_MODEL),
                "input": build_interviewer_input(candidate_answer, context),
            },
            headers={
                "Authorization": f"Bearer {os.environ[OPENAI_API_KEY_ENV]}",
            },
        )

        return extract_output_text(payload)


def build_interviewer_input(
    candidate_answer: str | None,
    context: dict,
) -> list[dict[str, Any]]:
    return [
        {
            "role": "system",
            "content": INTERVIEWER_SYSTEM_PROMPT,
        },
        {
            "role": "user",
            "content": build_interviewer_context(candidate_answer, context),
        },
    ]


def extract_output_text(payload: dict[str, Any]) -> str:
    output_text = payload.get("output_text")

    if isinstance(output_text, str) and output_text:
        return output_text

    for item in payload.get("output", []):
        for content in item.get("content", []):
            text = content.get("text")

            if isinstance(text, str) and text:
                return text

    raise RuntimeError("OpenAI response did not include output text")
