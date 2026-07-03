from datetime import datetime
from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field


class InterviewMode(StrEnum):
    RESUME = "resume"
    DOMAIN = "domain"
    DSA = "dsa"


class STTProvider(StrEnum):
    MOCK = "mock"
    DEEPGRAM = "deepgram"
    SMALLEST_AI = "smallest-ai"
    WHISPER = "whisper"


class LLMProvider(StrEnum):
    MOCK = "mock"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"


class TTSProvider(StrEnum):
    MOCK = "mock"
    CARTESIA = "cartesia"
    ELEVENLABS = "elevenlabs"
    SMALLEST_AI = "smallest-ai"


class ProviderSelection(BaseModel):
    stt: STTProvider = STTProvider.MOCK
    llm: LLMProvider = LLMProvider.MOCK
    tts: TTSProvider = TTSProvider.MOCK


class SessionState(StrEnum):
    SETUP_COMPLETE = "setup_complete"
    LISTENING = "listening"
    PROCESSING = "processing"
    AI_SPEAKING = "ai_speaking"
    SESSION_END = "session_end"


class CreateSessionRequest(BaseModel):
    mode: InterviewMode
    providers: ProviderSelection = Field(default_factory=ProviderSelection)
    setup: dict[str, Any] = Field(default_factory=dict)


class Session(BaseModel):
    id: str
    mode: InterviewMode
    providers: ProviderSelection
    setup: dict[str, Any]
    state: SessionState
    created_at: datetime
    updated_at: datetime
