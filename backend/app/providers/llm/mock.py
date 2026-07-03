from app.providers.base import ProviderKind, ProviderMetadata
from app.providers.llm.base import LLMProviderBase


class MockLLMProvider(LLMProviderBase):
    metadata = ProviderMetadata(
        key="mock",
        kind=ProviderKind.LLM,
        display_name="Mock LLM",
        is_mock=True,
    )

    def is_configured(self) -> bool:
        return True

    async def generate_response(self, prompt: str, context: dict) -> str:
        return "Mock interviewer response."
