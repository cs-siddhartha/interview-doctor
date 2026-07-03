from abc import abstractmethod

from app.providers.base import Provider


class TTSProviderBase(Provider):
    @abstractmethod
    async def synthesize(self, text: str) -> bytes:
        """Convert text into an audio payload."""
