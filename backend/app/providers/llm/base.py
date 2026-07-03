from abc import abstractmethod

from app.providers.base import Provider


class LLMProviderBase(Provider):
    @abstractmethod
    async def generate_response(self, prompt: str, context: dict) -> str:
        """Generate the interviewer response for the current turn."""
