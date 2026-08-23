export const PROVIDER_FIELD_IDS = ["stt", "llm", "tts"] as const;
export const DEFAULT_STT_PROVIDER_VALUE = "whisper";
export const DEFAULT_LLM_PROVIDER_VALUE = "openai";
export const DEFAULT_TTS_PROVIDER_VALUE = "elevenlabs";
export const PROVIDER_TRANSPORT_VALUES = [
  "batch_http",
  "streaming_http",
  "websocket",
  "webrtc",
] as const;
export const DEFAULT_PROVIDER_TRANSPORT = PROVIDER_TRANSPORT_VALUES[0];
export const SESSION_TRANSPORT_VALUES = ["batch_http", "websocket"] as const;
export const DEFAULT_SESSION_TRANSPORT = SESSION_TRANSPORT_VALUES[0];

export const SESSION_TRANSPORT_OPTIONS = [
  {
    label: "Turn-based",
    value: SESSION_TRANSPORT_VALUES[0],
    description: "Record and submit one complete answer at a time.",
  },
  {
    label: "Realtime",
    value: SESSION_TRANSPORT_VALUES[1],
    description: "Stream speech and hear responses with lower latency.",
  },
] as const;

export const REALTIME_PROVIDER_VALUES = {
  stt: ["deepgram"],
  llm: ["openai"],
  tts: ["elevenlabs", "openai"],
} as const;

export const STT_PROVIDER_VALUES = [
  DEFAULT_STT_PROVIDER_VALUE,
  "deepgram",
  "smallest-ai",
] as const;

export const LLM_PROVIDER_VALUES = [
  DEFAULT_LLM_PROVIDER_VALUE,
  "anthropic",
] as const;

export const TTS_PROVIDER_VALUES = [
  DEFAULT_TTS_PROVIDER_VALUE,
  "openai",
  "cartesia",
  "smallest-ai",
] as const;

export const PROVIDER_OPTIONS = {
  stt: [
    {
      label: "Whisper",
      value: STT_PROVIDER_VALUES[0],
    },
    {
      label: "Deepgram",
      value: STT_PROVIDER_VALUES[1],
    },
    {
      label: "Smallest AI",
      value: STT_PROVIDER_VALUES[2],
    },
  ],
  llm: [
    {
      label: "OpenAI",
      value: LLM_PROVIDER_VALUES[0],
    },
    {
      label: "Anthropic",
      value: LLM_PROVIDER_VALUES[1],
    },
  ],
  tts: [
    {
      label: "ElevenLabs",
      value: TTS_PROVIDER_VALUES[0],
    },
    {
      label: "OpenAI",
      value: TTS_PROVIDER_VALUES[1],
    },
    {
      label: "Cartesia",
      value: TTS_PROVIDER_VALUES[2],
    },
    {
      label: "Smallest AI",
      value: TTS_PROVIDER_VALUES[3],
    },
  ],
} as const;

export const PROVIDER_FIELDS = [
  { id: "stt", label: "Speech to text", shortLabel: "STT" },
  { id: "llm", label: "Interviewer brain", shortLabel: "LLM" },
  { id: "tts", label: "Voice output", shortLabel: "TTS" },
] as const;
