from abc import abstractmethod

from app.providers.base import Provider


class LLMProviderBase(Provider):
    @abstractmethod
    async def generate_response(
        self,
        candidate_answer: str | None,
        context: dict,
    ) -> str:
        """Generate the interviewer response for the current turn."""
