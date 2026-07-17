export const PROVIDER_FIELD_IDS = ["stt", "llm", "tts"] as const;
export const DEFAULT_PROVIDER_VALUE = "mock";
export const PROVIDER_TRANSPORT_VALUES = [
  "batch_http",
  "streaming_http",
  "websocket",
  "webrtc",
] as const;
export const DEFAULT_PROVIDER_TRANSPORT = PROVIDER_TRANSPORT_VALUES[0];
export const PROVIDER_TRANSPORT_FIELD_IDS = [
  "sttTransport",
  "llmTransport",
  "ttsTransport",
] as const;
export const PROVIDER_TRANSPORT_LABEL = "Transport";

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
    {
      label: "Mock",
      value: STT_PROVIDER_VALUES[0],
      defaultTransport: DEFAULT_PROVIDER_TRANSPORT,
    },
    {
      label: "Deepgram",
      value: STT_PROVIDER_VALUES[1],
      defaultTransport: "websocket",
    },
    {
      label: "Smallest AI",
      value: STT_PROVIDER_VALUES[2],
      defaultTransport: "websocket",
    },
    {
      label: "Whisper",
      value: STT_PROVIDER_VALUES[3],
      defaultTransport: DEFAULT_PROVIDER_TRANSPORT,
    },
  ],
  llm: [
    {
      label: "Mock",
      value: LLM_PROVIDER_VALUES[0],
      defaultTransport: DEFAULT_PROVIDER_TRANSPORT,
    },
    {
      label: "OpenAI",
      value: LLM_PROVIDER_VALUES[1],
      defaultTransport: "streaming_http",
    },
    {
      label: "Anthropic",
      value: LLM_PROVIDER_VALUES[2],
      defaultTransport: "streaming_http",
    },
  ],
  tts: [
    {
      label: "Mock",
      value: TTS_PROVIDER_VALUES[0],
      defaultTransport: DEFAULT_PROVIDER_TRANSPORT,
    },
    {
      label: "Cartesia",
      value: TTS_PROVIDER_VALUES[1],
      defaultTransport: "websocket",
    },
    {
      label: "ElevenLabs",
      value: TTS_PROVIDER_VALUES[2],
      defaultTransport: "websocket",
    },
    {
      label: "Smallest AI",
      value: TTS_PROVIDER_VALUES[3],
      defaultTransport: "websocket",
    },
  ],
} as const;

export const PROVIDER_TRANSPORT_OPTIONS = [
  { label: "REST", value: PROVIDER_TRANSPORT_VALUES[0] },
  { label: "Streaming HTTP", value: PROVIDER_TRANSPORT_VALUES[1] },
  { label: "WebSocket", value: PROVIDER_TRANSPORT_VALUES[2] },
  { label: "WebRTC", value: PROVIDER_TRANSPORT_VALUES[3] },
] as const;

export const PROVIDER_FIELDS = [
  { id: "stt", label: "Speech to text", shortLabel: "STT" },
  { id: "llm", label: "Interviewer brain", shortLabel: "LLM" },
  { id: "tts", label: "Voice output", shortLabel: "TTS" },
] as const;
