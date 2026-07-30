import {
  IconBrain,
  IconCode,
  IconFileText,
  type Icon,
} from "@tabler/icons-react";

import {
  DOMAIN_MODE,
  ALGORITHMS_MODE,
  RESUME_MODE,
} from "@/constants/interview-modes";
import { PROVIDER_FIELDS, PROVIDER_OPTIONS } from "@/constants/providers";
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
  highlights: readonly string[];
  icon: Icon;
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
    highlights: ["Project claims", "Ownership depth", "Impact metrics"],
    icon: IconFileText,
  },
  {
    title: DOMAIN_MODE.title,
    mode: DOMAIN_MODE.id,
    action: DOMAIN_MODE.setupPath,
    description: DOMAIN_MODE.description,
    highlights: ["Core concepts", "Trade-off analysis", "Role depth"],
    icon: IconBrain,
  },
  {
    title: ALGORITHMS_MODE.title,
    mode: ALGORITHMS_MODE.id,
    action: ALGORITHMS_MODE.setupPath,
    description: ALGORITHMS_MODE.description,
    highlights: ["Problem solving", "Complexity", "Clear explanation"],
    icon: IconCode,
  },
];

export const interviewModeById = new Map(
  interviewModes.map((mode) => [mode.mode, mode]),
);
