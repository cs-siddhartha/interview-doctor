from app.providers.base import ProviderKind, ProviderMetadata, ProviderTransport
from app.providers.tts.base import TTSProviderBase


class MockTTSProvider(TTSProviderBase):
    metadata = ProviderMetadata(
        key="mock",
        kind=ProviderKind.TTS,
        display_name="Mock TTS",
        is_mock=True,
        transports=frozenset({ProviderTransport.BATCH_HTTP}),
        default_transport=ProviderTransport.BATCH_HTTP,
    )

    def is_configured(self) -> bool:
        return True

    async def synthesize(self, text: str) -> bytes:
        return b"mock-audio"
