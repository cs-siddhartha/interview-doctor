export const PROVIDER_FIELD_IDS = ["stt", "llm", "tts"] as const;
export const DEFAULT_PROVIDER_VALUE = "mock";

export const STT_PROVIDER_VALUES = [
  DEFAULT_PROVIDER_VALUE,
  "deepgram",
  "smallest-ai",
  "whisper",
] as const;

export const LLM_PROVIDER_VALUES = [
  DEFAULT_PROVIDER_VALUE,
  "openai",
  "anthropic",
] as const;

export const TTS_PROVIDER_VALUES = [
  DEFAULT_PROVIDER_VALUE,
  "cartesia",
  "elevenlabs",
  "smallest-ai",
] as const;

export const PROVIDER_OPTIONS = {
  stt: [
    { label: "Mock", value: STT_PROVIDER_VALUES[0] },
    { label: "Deepgram", value: STT_PROVIDER_VALUES[1] },
    { label: "Smallest AI", value: STT_PROVIDER_VALUES[2] },
    { label: "Whisper", value: STT_PROVIDER_VALUES[3] },
  ],
  llm: [
    { label: "Mock", value: LLM_PROVIDER_VALUES[0] },
    { label: "OpenAI", value: LLM_PROVIDER_VALUES[1] },
    { label: "Anthropic", value: LLM_PROVIDER_VALUES[2] },
  ],
  tts: [
    { label: "Mock", value: TTS_PROVIDER_VALUES[0] },
    { label: "Cartesia", value: TTS_PROVIDER_VALUES[1] },
    { label: "ElevenLabs", value: TTS_PROVIDER_VALUES[2] },
    { label: "Smallest AI", value: TTS_PROVIDER_VALUES[3] },
  ],
} as const;

export const PROVIDER_FIELDS = [
  { id: "stt", label: "Speech to text", shortLabel: "STT" },
  { id: "llm", label: "Interviewer brain", shortLabel: "LLM" },
  { id: "tts", label: "Voice output", shortLabel: "TTS" },
] as const;
