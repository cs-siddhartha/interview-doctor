from dataclasses import dataclass

from app.providers.base import ProviderKind, ProviderMetadata, ProviderTransport
from app.providers.llm.anthropic import AnthropicLLMProvider
from app.providers.llm.base import LLMProviderBase
from app.providers.llm.openai import OpenAILLMProvider
from app.providers.stt.base import STTProviderBase
from app.providers.stt.deepgram import DeepgramSTTProvider
from app.providers.stt.smallest_ai import SmallestAISTTProvider
from app.providers.stt.whisper import WhisperSTTProvider
from app.providers.tts.base import TTSProviderBase
from app.providers.tts.cartesia import CartesiaTTSProvider
from app.providers.tts.elevenlabs import ElevenLabsTTSProvider
from app.providers.tts.smallest_ai import SmallestAITTSProvider
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


class ProviderNotConfiguredError(ProviderRegistryError):
    pass


stt_provider_catalog: dict[str, ProviderMetadata] = {
    "deepgram": ProviderMetadata(
        key="deepgram",
        kind=ProviderKind.STT,
        display_name="Deepgram",
        transports=frozenset(
            {ProviderTransport.BATCH_HTTP, ProviderTransport.WEBSOCKET}
        ),
        default_transport=ProviderTransport.BATCH_HTTP,
    ),
    "smallest-ai": ProviderMetadata(
        key="smallest-ai",
        kind=ProviderKind.STT,
        display_name="Smallest AI",
        transports=frozenset(
            {ProviderTransport.BATCH_HTTP, ProviderTransport.WEBSOCKET}
        ),
        default_transport=ProviderTransport.BATCH_HTTP,
    ),
    "whisper": ProviderMetadata(
        key="whisper",
        kind=ProviderKind.STT,
        display_name="Whisper",
        transports=frozenset({ProviderTransport.BATCH_HTTP}),
        default_transport=ProviderTransport.BATCH_HTTP,
    ),
}

llm_provider_catalog: dict[str, ProviderMetadata] = {
    "openai": ProviderMetadata(
        key="openai",
        kind=ProviderKind.LLM,
        display_name="OpenAI",
        transports=frozenset(
            {
                ProviderTransport.BATCH_HTTP,
                ProviderTransport.STREAMING_HTTP,
                ProviderTransport.WEBSOCKET,
                ProviderTransport.WEBRTC,
            }
        ),
        default_transport=ProviderTransport.BATCH_HTTP,
    ),
    "anthropic": ProviderMetadata(
        key="anthropic",
        kind=ProviderKind.LLM,
        display_name="Anthropic",
        transports=frozenset(
            {ProviderTransport.BATCH_HTTP, ProviderTransport.STREAMING_HTTP}
        ),
        default_transport=ProviderTransport.BATCH_HTTP,
    ),
}

tts_provider_catalog: dict[str, ProviderMetadata] = {
    "cartesia": ProviderMetadata(
        key="cartesia",
        kind=ProviderKind.TTS,
        display_name="Cartesia",
        transports=frozenset(
            {
                ProviderTransport.BATCH_HTTP,
                ProviderTransport.STREAMING_HTTP,
                ProviderTransport.WEBSOCKET,
            }
        ),
        default_transport=ProviderTransport.BATCH_HTTP,
    ),
    "elevenlabs": ProviderMetadata(
        key="elevenlabs",
        kind=ProviderKind.TTS,
        display_name="ElevenLabs",
        transports=frozenset(
            {
                ProviderTransport.BATCH_HTTP,
                ProviderTransport.STREAMING_HTTP,
                ProviderTransport.WEBSOCKET,
            }
        ),
        default_transport=ProviderTransport.BATCH_HTTP,
    ),
    "smallest-ai": ProviderMetadata(
        key="smallest-ai",
        kind=ProviderKind.TTS,
        display_name="Smallest AI",
        transports=frozenset(
            {
                ProviderTransport.BATCH_HTTP,
                ProviderTransport.STREAMING_HTTP,
                ProviderTransport.WEBSOCKET,
            }
        ),
        default_transport=ProviderTransport.BATCH_HTTP,
    ),
}

stt_providers: dict[str, type[STTProviderBase]] = {
    DeepgramSTTProvider.metadata.key: DeepgramSTTProvider,
    SmallestAISTTProvider.metadata.key: SmallestAISTTProvider,
    WhisperSTTProvider.metadata.key: WhisperSTTProvider,
}

llm_providers: dict[str, type[LLMProviderBase]] = {
    OpenAILLMProvider.metadata.key: OpenAILLMProvider,
    AnthropicLLMProvider.metadata.key: AnthropicLLMProvider,
}

tts_providers: dict[str, type[TTSProviderBase]] = {
    CartesiaTTSProvider.metadata.key: CartesiaTTSProvider,
    ElevenLabsTTSProvider.metadata.key: ElevenLabsTTSProvider,
    SmallestAITTSProvider.metadata.key: SmallestAITTSProvider,
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

    validate_adapter_transport(key, transport, provider_type.metadata)

    return build_configured_provider(provider_type)


def resolve_llm_provider(
    key: str,
    transport: ProviderTransport,
) -> LLMProviderBase:
    validate_provider_transport(key, transport, llm_provider_catalog)
    provider_type = llm_providers.get(key)

    if provider_type is None:
        raise ProviderNotImplementedError(f"LLM provider '{key}' is not implemented")

    validate_adapter_transport(key, transport, provider_type.metadata)

    return build_configured_provider(provider_type)


def resolve_tts_provider(
    key: str,
    transport: ProviderTransport,
) -> TTSProviderBase:
    validate_provider_transport(key, transport, tts_provider_catalog)
    provider_type = tts_providers.get(key)

    if provider_type is None:
        raise ProviderNotImplementedError(f"TTS provider '{key}' is not implemented")

    validate_adapter_transport(key, transport, provider_type.metadata)

    return build_configured_provider(provider_type)


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

def validate_adapter_transport(
    key: str,
    transport: ProviderTransport,
    metadata: ProviderMetadata,
) -> None:
    if transport not in metadata.transports:
        raise ProviderNotImplementedError(
            f"{metadata.display_name} provider '{key}' does not implement "
            f"{transport.value}"
        )


def build_configured_provider[
    ProviderType: STTProviderBase | LLMProviderBase | TTSProviderBase,
](
    provider_type: type[ProviderType],
) -> ProviderType:
    provider = provider_type()

    if not provider.is_configured():
        raise ProviderNotConfiguredError(
            f"{provider.metadata.display_name} provider is not configured"
        )

    return provider
