import {
  IconBrain,
  IconCode,
  IconFileText,
  type Icon,
} from "@tabler/icons-react";

import {
  type InterviewModeId,
  type ProviderFieldId,
} from "@/lib/schemas/interview";

export type { InterviewModeId, ProviderFieldId };

export type ProviderOption = {
  label: string;
  value: string;
};

export type InterviewMode = {
  title: string;
  mode: InterviewModeId;
  action: string;
  description: string;
  icon: Icon;
  signal: string;
};

export const providerOptions: Record<ProviderFieldId, ProviderOption[]> = {
  stt: [
    { label: "Mock", value: "mock" },
    { label: "Deepgram", value: "deepgram" },
    { label: "Smallest AI", value: "smallest-ai" },
    { label: "Whisper", value: "whisper" },
  ],
  llm: [
    { label: "Mock", value: "mock" },
    { label: "OpenAI", value: "openai" },
    { label: "Anthropic", value: "anthropic" },
  ],
  tts: [
    { label: "Mock", value: "mock" },
    { label: "Cartesia", value: "cartesia" },
    { label: "ElevenLabs", value: "elevenlabs" },
    { label: "Smallest AI", value: "smallest-ai" },
  ],
};

export const providerFields: { id: ProviderFieldId; label: string }[] = [
  { id: "stt", label: "Speech to text" },
  { id: "llm", label: "Interviewer brain" },
  { id: "tts", label: "Voice output" },
];

export const interviewModes: InterviewMode[] = [
  {
    title: "Resume Grilling",
    mode: "resume",
    action: "/resume/setup",
    description:
      "Upload a resume and let the interviewer challenge claims, projects, and experience depth.",
    icon: IconFileText,
    signal: "Resume-aware",
  },
  {
    title: "Domain Interview",
    mode: "domain",
    action: "/domain/setup",
    description:
      "Choose a role, skill, or topic and run a focused conversational interview.",
    icon: IconBrain,
    signal: "Topic-driven",
  },
  {
    title: "DSA Interview",
    mode: "dsa",
    action: "/dsa/setup",
    description:
      "Pick a data structures topic and practice explaining a solution while coding.",
    icon: IconCode,
    signal: "Code-assisted",
  },
];

export const interviewModeById = new Map(
  interviewModes.map((mode) => [mode.mode, mode]),
);
