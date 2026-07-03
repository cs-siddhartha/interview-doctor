from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import StrEnum


class ProviderKind(StrEnum):
    STT = "stt"
    LLM = "llm"
    TTS = "tts"


@dataclass(frozen=True)
class ProviderMetadata:
    key: str
    kind: ProviderKind
    display_name: str
    is_mock: bool


class Provider(ABC):
    metadata: ProviderMetadata

    @abstractmethod
    def is_configured(self) -> bool:
        """Return whether this provider can run in the current environment."""
