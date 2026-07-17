from dataclasses import dataclass

from app.providers.base import ProviderKind, ProviderMetadata, ProviderTransport
from app.providers.llm.base import LLMProviderBase
from app.providers.llm.mock import MockLLMProvider
from app.providers.stt.base import STTProviderBase
from app.providers.stt.mock import MockSTTProvider
from app.providers.tts.base import TTSProviderBase
from app.providers.tts.mock import MockTTSProvider
from app.schemas.session import ProviderSelection


@dataclass(frozen=True)
class ProviderStack:
    stt: STTProviderBase
    llm: LLMProviderBase
    tts: TTSProviderBase


class ProviderRegistryError(ValueError):
    pass


class UnsupportedProviderTransportError(ProviderRegistryError):
    pass


class ProviderNotImplementedError(ProviderRegistryError):
    pass


stt_provider_catalog: dict[str, ProviderMetadata] = {
    MockSTTProvider.metadata.key: MockSTTProvider.metadata,
    "deepgram": ProviderMetadata(
        key="deepgram",
        kind=ProviderKind.STT,
        display_name="Deepgram",
        is_mock=False,
        transports=frozenset(
            {ProviderTransport.BATCH_HTTP, ProviderTransport.WEBSOCKET}
        ),
        default_transport=ProviderTransport.WEBSOCKET,
    ),
    "smallest-ai": ProviderMetadata(
        key="smallest-ai",
        kind=ProviderKind.STT,
        display_name="Smallest AI",
        is_mock=False,
        transports=frozenset(
            {ProviderTransport.BATCH_HTTP, ProviderTransport.WEBSOCKET}
        ),
        default_transport=ProviderTransport.WEBSOCKET,
    ),
    "whisper": ProviderMetadata(
        key="whisper",
        kind=ProviderKind.STT,
        display_name="Whisper",
        is_mock=False,
        transports=frozenset({ProviderTransport.BATCH_HTTP}),
        default_transport=ProviderTransport.BATCH_HTTP,
    ),
}

llm_provider_catalog: dict[str, ProviderMetadata] = {
    MockLLMProvider.metadata.key: MockLLMProvider.metadata,
    "openai": ProviderMetadata(
        key="openai",
        kind=ProviderKind.LLM,
        display_name="OpenAI",
        is_mock=False,
        transports=frozenset(
            {
                ProviderTransport.BATCH_HTTP,
                ProviderTransport.STREAMING_HTTP,
                ProviderTransport.WEBSOCKET,
                ProviderTransport.WEBRTC,
            }
        ),
        default_transport=ProviderTransport.STREAMING_HTTP,
    ),
    "anthropic": ProviderMetadata(
        key="anthropic",
        kind=ProviderKind.LLM,
        display_name="Anthropic",
        is_mock=False,
        transports=frozenset(
            {ProviderTransport.BATCH_HTTP, ProviderTransport.STREAMING_HTTP}
        ),
        default_transport=ProviderTransport.STREAMING_HTTP,
    ),
}

tts_provider_catalog: dict[str, ProviderMetadata] = {
    MockTTSProvider.metadata.key: MockTTSProvider.metadata,
    "cartesia": ProviderMetadata(
        key="cartesia",
        kind=ProviderKind.TTS,
        display_name="Cartesia",
        is_mock=False,
        transports=frozenset(
            {
                ProviderTransport.BATCH_HTTP,
                ProviderTransport.STREAMING_HTTP,
                ProviderTransport.WEBSOCKET,
            }
        ),
        default_transport=ProviderTransport.WEBSOCKET,
    ),
    "elevenlabs": ProviderMetadata(
        key="elevenlabs",
        kind=ProviderKind.TTS,
        display_name="ElevenLabs",
        is_mock=False,
        transports=frozenset(
            {
                ProviderTransport.BATCH_HTTP,
                ProviderTransport.STREAMING_HTTP,
                ProviderTransport.WEBSOCKET,
            }
        ),
        default_transport=ProviderTransport.WEBSOCKET,
    ),
    "smallest-ai": ProviderMetadata(
        key="smallest-ai",
        kind=ProviderKind.TTS,
        display_name="Smallest AI",
        is_mock=False,
        transports=frozenset(
            {
                ProviderTransport.BATCH_HTTP,
                ProviderTransport.STREAMING_HTTP,
                ProviderTransport.WEBSOCKET,
            }
        ),
        default_transport=ProviderTransport.WEBSOCKET,
    ),
}

stt_providers: dict[str, type[STTProviderBase]] = {
    MockSTTProvider.metadata.key: MockSTTProvider,
}

llm_providers: dict[str, type[LLMProviderBase]] = {
    MockLLMProvider.metadata.key: MockLLMProvider,
}

tts_providers: dict[str, type[TTSProviderBase]] = {
    MockTTSProvider.metadata.key: MockTTSProvider,
}


def build_provider_stack(selection: ProviderSelection) -> ProviderStack:
    return ProviderStack(
        stt=resolve_stt_provider(selection.stt.provider.value, selection.stt.transport),
        llm=resolve_llm_provider(selection.llm.provider.value, selection.llm.transport),
        tts=resolve_tts_provider(selection.tts.provider.value, selection.tts.transport),
    )


def resolve_stt_provider(
    key: str,
    transport: ProviderTransport,
) -> STTProviderBase:
    validate_provider_transport(key, transport, stt_provider_catalog)
    provider_type = stt_providers.get(key)

    if provider_type is None:
        raise ProviderNotImplementedError(f"STT provider '{key}' is not implemented")

    return provider_type()


def resolve_llm_provider(
    key: str,
    transport: ProviderTransport,
) -> LLMProviderBase:
    validate_provider_transport(key, transport, llm_provider_catalog)
    provider_type = llm_providers.get(key)

    if provider_type is None:
        raise ProviderNotImplementedError(f"LLM provider '{key}' is not implemented")

    return provider_type()


def resolve_tts_provider(
    key: str,
    transport: ProviderTransport,
) -> TTSProviderBase:
    validate_provider_transport(key, transport, tts_provider_catalog)
    provider_type = tts_providers.get(key)

    if provider_type is None:
        raise ProviderNotImplementedError(f"TTS provider '{key}' is not implemented")

    return provider_type()


def validate_provider_transport(
    key: str,
    transport: ProviderTransport,
    catalog: dict[str, ProviderMetadata],
) -> ProviderMetadata:
    metadata = catalog[key]

    if transport not in metadata.transports:
        raise UnsupportedProviderTransportError(
            f"{metadata.display_name} does not support {transport.value}"
        )

    return metadata
