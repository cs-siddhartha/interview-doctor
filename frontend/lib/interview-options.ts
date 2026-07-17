import {
  IconBrain,
  IconCode,
  IconFileText,
  type Icon,
} from "@tabler/icons-react";

import {
  DOMAIN_MODE,
  DSA_MODE,
  RESUME_MODE,
} from "@/constants/interview-modes";
import { PROVIDER_FIELDS, PROVIDER_OPTIONS } from "@/constants/providers";
import {
  type InterviewModeId,
  type ProviderFieldId,
  type ProviderTransportValue,
} from "@/lib/schemas/interview";

export type { InterviewModeId, ProviderFieldId };

export type ProviderOption = {
  label: string;
  value: string;
  defaultTransport: ProviderTransportValue;
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
  stt: [...PROVIDER_OPTIONS.stt],
  llm: [...PROVIDER_OPTIONS.llm],
  tts: [...PROVIDER_OPTIONS.tts],
};

export const providerFields: { id: ProviderFieldId; label: string }[] = [
  ...PROVIDER_FIELDS.map(({ id, label }) => ({ id, label })),
];

export const interviewModes: InterviewMode[] = [
  {
    title: RESUME_MODE.title,
    mode: RESUME_MODE.id,
    action: RESUME_MODE.setupPath,
    description: RESUME_MODE.description,
    icon: IconFileText,
    signal: RESUME_MODE.signal,
  },
  {
    title: DOMAIN_MODE.title,
    mode: DOMAIN_MODE.id,
    action: DOMAIN_MODE.setupPath,
    description: DOMAIN_MODE.description,
    icon: IconBrain,
    signal: DOMAIN_MODE.signal,
  },
  {
    title: DSA_MODE.title,
    mode: DSA_MODE.id,
    action: DSA_MODE.setupPath,
    description: DSA_MODE.description,
    icon: IconCode,
    signal: DSA_MODE.signal,
  },
];

export const interviewModeById = new Map(
  interviewModes.map((mode) => [mode.mode, mode]),
);
