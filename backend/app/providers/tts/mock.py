from app.providers.base import ProviderKind, ProviderMetadata
from app.providers.tts.base import TTSProviderBase


class MockTTSProvider(TTSProviderBase):
    metadata = ProviderMetadata(
        key="mock",
        kind=ProviderKind.TTS,
        display_name="Mock TTS",
        is_mock=True,
    )

    def is_configured(self) -> bool:
        return True

    async def synthesize(self, text: str) -> bytes:
        return b"mock-audio"
