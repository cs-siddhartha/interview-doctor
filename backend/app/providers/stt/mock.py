from app.providers.base import ProviderKind, ProviderMetadata
from app.providers.stt.base import STTProviderBase


class MockSTTProvider(STTProviderBase):
    metadata = ProviderMetadata(
        key="mock",
        kind=ProviderKind.STT,
        display_name="Mock STT",
        is_mock=True,
    )

    def is_configured(self) -> bool:
        return True

    async def transcribe(self, audio: bytes) -> str:
        return "Mock transcript from audio input."
