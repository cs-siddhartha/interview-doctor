from datetime import datetime
from enum import StrEnum
from typing import Annotated, Literal

from pydantic import BaseModel, Field

from app.providers.base import ProviderTransport

MAX_AUDIO_BASE64_CHARACTERS = 8 * 1024 * 1024
MAX_SETUP_VALUE_CHARACTERS = 500
SUPPORTED_AUDIO_MIME_TYPES = (
    "audio/mp4",
    "audio/mpeg",
    "audio/wav",
    "audio/webm",
    "audio/webm;codecs=opus",
)


class InterviewMode(StrEnum):
    RESUME = "resume"
    DOMAIN = "domain"
    ALGORITHMS = "algorithms"
    SYSTEM_DESIGN = "system-design"


class SessionTransport(StrEnum):
    BATCH_HTTP = "batch_http"
    WEBSOCKET = "websocket"


class STTProvider(StrEnum):
    DEEPGRAM = "deepgram"
    SMALLEST_AI = "smallest-ai"
    WHISPER = "whisper"


class LLMProvider(StrEnum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"


class TTSProvider(StrEnum):
    CARTESIA = "cartesia"
    ELEVENLABS = "elevenlabs"
    OPENAI = "openai"
    SMALLEST_AI = "smallest-ai"


class STTProviderConfig(BaseModel):
    provider: STTProvider = STTProvider.WHISPER
    transport: ProviderTransport = ProviderTransport.BATCH_HTTP


class LLMProviderConfig(BaseModel):
    provider: LLMProvider = LLMProvider.OPENAI
    transport: ProviderTransport = ProviderTransport.BATCH_HTTP


class TTSProviderConfig(BaseModel):
    provider: TTSProvider = TTSProvider.ELEVENLABS
    transport: ProviderTransport = ProviderTransport.BATCH_HTTP


class ProviderSelection(BaseModel):
    stt: STTProviderConfig = Field(default_factory=STTProviderConfig)
    llm: LLMProviderConfig = Field(default_factory=LLMProviderConfig)
    tts: TTSProviderConfig = Field(default_factory=TTSProviderConfig)


class ResumeSetup(BaseModel):
    targetRole: str = Field(min_length=1, max_length=200)
    intensity: Literal["Balanced", "Strict", "Very strict"]
    resumeDocumentId: str = Field(min_length=1)


class DomainSetup(BaseModel):
    domain: str = Field(min_length=1, max_length=MAX_SETUP_VALUE_CHARACTERS)
    seniority: Literal["Junior", "Mid-level", "Senior", "Staff"]
    style: Literal["Conversational", "Structured", "Rapid follow-up"]


class AlgorithmsSetup(BaseModel):
    topic: Literal["Arrays", "Strings", "Graphs", "Dynamic programming"]
    difficulty: Literal["Easy", "Medium", "Hard"]
    language: str = Field(min_length=1, max_length=100)


class SystemDesignSetup(BaseModel):
    problem: str = Field(default="", max_length=MAX_SETUP_VALUE_CHARACTERS)
    seniority: Literal["Mid-level", "Senior", "Staff"]


class SessionState(StrEnum):
    SETUP_COMPLETE = "setup_complete"
    LISTENING = "listening"
    PROCESSING = "processing"
    LLM_THINKING = "llm_thinking"
    AI_SPEAKING = "ai_speaking"
    SESSION_END = "session_end"


class TranscriptSpeaker(StrEnum):
    CANDIDATE = "candidate"
    AI_INTERVIEWER = "ai_interviewer"


class TranscriptTurn(BaseModel):
    speaker: TranscriptSpeaker
    text: str = Field(min_length=1, max_length=8000)
    created_at: datetime


class ReportEvidence(BaseModel):
    turn_index: int = Field(ge=0)
    quote: str = Field(min_length=1, max_length=500)


class ReportCategory(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    score: int = Field(ge=1, le=5)
    rationale: str = Field(min_length=1, max_length=1000)
    evidence: list[ReportEvidence] = Field(min_length=1, max_length=3)


class ReportImprovement(BaseModel):
    area: str = Field(min_length=1, max_length=120)
    action: str = Field(min_length=1, max_length=500)


class InterviewReport(BaseModel):
    overall_score: int = Field(ge=0, le=100)
    summary: str = Field(min_length=1, max_length=1200)
    categories: list[ReportCategory] = Field(min_length=1, max_length=5)
    strengths: list[Annotated[str, Field(min_length=1, max_length=500)]] = Field(
        min_length=1,
        max_length=5,
    )
    improvements: list[ReportImprovement] = Field(min_length=1, max_length=5)


class CreateTurnRequest(BaseModel):
    audio_base64: str = Field(min_length=1, max_length=MAX_AUDIO_BASE64_CHARACTERS)
    mime_type: Literal[
        "audio/mp4",
        "audio/mpeg",
        "audio/wav",
        "audio/webm",
        "audio/webm;codecs=opus",
    ]


# Restricts session updates to the supported terminal transition so clients
# cannot write arbitrary interview state values.
class UpdateSessionRequest(BaseModel):
    state: Literal[SessionState.SESSION_END]


class TurnResult(BaseModel):
    session_id: str
    candidate_turn: TranscriptTurn
    ai_turn: TranscriptTurn
    audio_base64: str
    audio_error: str | None = None
    state: SessionState


class CreateResumeSessionRequest(BaseModel):
    mode: Literal[InterviewMode.RESUME]
    transport: SessionTransport = SessionTransport.BATCH_HTTP
    providers: ProviderSelection = Field(default_factory=ProviderSelection)
    setup: ResumeSetup


class CreateDomainSessionRequest(BaseModel):
    mode: Literal[InterviewMode.DOMAIN]
    transport: SessionTransport = SessionTransport.BATCH_HTTP
    providers: ProviderSelection = Field(default_factory=ProviderSelection)
    setup: DomainSetup


class CreateAlgorithmsSessionRequest(BaseModel):
    mode: Literal[InterviewMode.ALGORITHMS]
    transport: SessionTransport = SessionTransport.BATCH_HTTP
    providers: ProviderSelection = Field(default_factory=ProviderSelection)
    setup: AlgorithmsSetup


class CreateSystemDesignSessionRequest(BaseModel):
    mode: Literal[InterviewMode.SYSTEM_DESIGN]
    transport: SessionTransport = SessionTransport.BATCH_HTTP
    providers: ProviderSelection = Field(default_factory=ProviderSelection)
    setup: SystemDesignSetup


CreateSessionRequest = Annotated[
    CreateResumeSessionRequest
    | CreateDomainSessionRequest
    | CreateAlgorithmsSessionRequest
    | CreateSystemDesignSessionRequest,
    Field(discriminator="mode"),
]

SessionSetup = ResumeSetup | DomainSetup | AlgorithmsSetup | SystemDesignSetup


class Session(BaseModel):
    id: str
    mode: InterviewMode
    transport: SessionTransport = SessionTransport.BATCH_HTTP
    providers: ProviderSelection
    setup: SessionSetup
    state: SessionState
    transcript: list[TranscriptTurn] = Field(default_factory=list)
    opening_audio_base64: str = ""
    opening_audio_error: str | None = None
    report: InterviewReport | None = None
    report_error: str | None = None
    version: int = Field(default=0, ge=0)
    created_at: datetime
    updated_at: datetime
