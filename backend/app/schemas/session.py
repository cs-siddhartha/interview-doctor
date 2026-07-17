from datetime import datetime
from enum import StrEnum
from typing import Annotated, Literal

from pydantic import BaseModel, Field

from app.providers.base import ProviderTransport


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


class STTProviderConfig(BaseModel):
    provider: STTProvider = STTProvider.MOCK
    transport: ProviderTransport = ProviderTransport.BATCH_HTTP


class LLMProviderConfig(BaseModel):
    provider: LLMProvider = LLMProvider.MOCK
    transport: ProviderTransport = ProviderTransport.BATCH_HTTP


class TTSProviderConfig(BaseModel):
    provider: TTSProvider = TTSProvider.MOCK
    transport: ProviderTransport = ProviderTransport.BATCH_HTTP


class ProviderSelection(BaseModel):
    stt: STTProviderConfig = Field(default_factory=STTProviderConfig)
    llm: LLMProviderConfig = Field(default_factory=LLMProviderConfig)
    tts: TTSProviderConfig = Field(default_factory=TTSProviderConfig)



class ResumeSetup(BaseModel):
    targetRole: str = Field(min_length=1)
    intensity: Literal["Balanced", "Strict", "Very strict"]


class DomainSetup(BaseModel):
    domain: str = Field(min_length=1)
    seniority: Literal["Junior", "Mid-level", "Senior", "Staff"]
    style: Literal["Conversational", "Structured", "Rapid follow-up"]


class DsaSetup(BaseModel):
    topic: Literal["Arrays", "Strings", "Graphs", "Dynamic programming"]
    difficulty: Literal["Easy", "Medium", "Hard"]
    language: str = Field(min_length=1)


class SessionState(StrEnum):
    SETUP_COMPLETE = "setup_complete"
    LISTENING = "listening"
    PROCESSING = "processing"
    AI_SPEAKING = "ai_speaking"
    SESSION_END = "session_end"


class CreateResumeSessionRequest(BaseModel):
    mode: Literal[InterviewMode.RESUME]
    providers: ProviderSelection = Field(default_factory=ProviderSelection)
    setup: ResumeSetup


class CreateDomainSessionRequest(BaseModel):
    mode: Literal[InterviewMode.DOMAIN]
    providers: ProviderSelection = Field(default_factory=ProviderSelection)
    setup: DomainSetup


class CreateDsaSessionRequest(BaseModel):
    mode: Literal[InterviewMode.DSA]
    providers: ProviderSelection = Field(default_factory=ProviderSelection)
    setup: DsaSetup


CreateSessionRequest = Annotated[
    CreateResumeSessionRequest | CreateDomainSessionRequest | CreateDsaSessionRequest,
    Field(discriminator="mode"),
]

SessionSetup = ResumeSetup | DomainSetup | DsaSetup


class Session(BaseModel):
    id: str
    mode: InterviewMode
    providers: ProviderSelection
    setup: SessionSetup
    state: SessionState
    created_at: datetime
    updated_at: datetime
