from dataclasses import dataclass

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
        stt=resolve_stt_provider(selection.stt.value),
        llm=resolve_llm_provider(selection.llm.value),
        tts=resolve_tts_provider(selection.tts.value),
    )


def resolve_stt_provider(key: str) -> STTProviderBase:
    provider_type = stt_providers.get(key, MockSTTProvider)
    return provider_type()


def resolve_llm_provider(key: str) -> LLMProviderBase:
    provider_type = llm_providers.get(key, MockLLMProvider)
    return provider_type()


def resolve_tts_provider(key: str) -> TTSProviderBase:
    provider_type = tts_providers.get(key, MockTTSProvider)
    return provider_type()
