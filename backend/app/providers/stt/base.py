from abc import abstractmethod

from app.providers.base import Provider


class STTProviderBase(Provider):
    @abstractmethod
    async def transcribe(self, audio: bytes) -> str:
        """Convert an audio payload into text."""
