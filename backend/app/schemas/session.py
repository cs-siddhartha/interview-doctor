from datetime import datetime
from enum import StrEnum
from typing import Annotated, Literal

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


# Captures the resume setup fields the frontend submits so session creation
# rejects missing or unrelated setup payloads before provider work begins.
class ResumeSetup(BaseModel):
    targetRole: str = Field(min_length=1)
    intensity: Literal["Balanced", "Strict", "Very strict"]


# Captures topic-led interview setup separately from other modes because the
# values drive different interviewer context and should not share a loose dict.
class DomainSetup(BaseModel):
    domain: str = Field(min_length=1)
    seniority: Literal["Junior", "Mid-level", "Senior", "Staff"]
    style: Literal["Conversational", "Structured", "Rapid follow-up"]


# Captures DSA setup as its own contract because this mode needs code-workspace
# context and problem difficulty instead of resume/domain fields.
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


# Binds the resume mode discriminator to the exact setup shape accepted for
# resume-driven sessions while preserving the shared provider selection contract.
class CreateResumeSessionRequest(BaseModel):
    mode: Literal[InterviewMode.RESUME]
    providers: ProviderSelection = Field(default_factory=ProviderSelection)
    setup: ResumeSetup


# Binds the domain mode discriminator to the exact setup shape accepted for
# topic-led sessions while preserving the shared provider selection contract.
class CreateDomainSessionRequest(BaseModel):
    mode: Literal[InterviewMode.DOMAIN]
    providers: ProviderSelection = Field(default_factory=ProviderSelection)
    setup: DomainSetup


# Binds the DSA mode discriminator to the exact setup shape accepted for
# code-focused sessions while preserving the shared provider selection contract.
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
