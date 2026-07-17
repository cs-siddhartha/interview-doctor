import { z } from "zod";

import {
  DEFAULT_PROVIDER_VALUE,
  DEFAULT_PROVIDER_TRANSPORT,
  LLM_PROVIDER_VALUES,
  PROVIDER_FIELD_IDS,
  PROVIDER_TRANSPORT_VALUES,
  STT_PROVIDER_VALUES,
  TTS_PROVIDER_VALUES,
} from "@/constants/providers";
import { INTERVIEW_MODE_IDS } from "@/constants/interview-modes";

export const interviewModeSchema = z.enum(INTERVIEW_MODE_IDS);
export const providerFieldSchema = z.enum(PROVIDER_FIELD_IDS);
export const providerTransportSchema = z.enum(PROVIDER_TRANSPORT_VALUES);

export const sttProviderSchema = z.enum(STT_PROVIDER_VALUES);
export const llmProviderSchema = z.enum(LLM_PROVIDER_VALUES);
export const ttsProviderSchema = z.enum(TTS_PROVIDER_VALUES);

export const sttProviderConfigSchema = z.object({
  provider: sttProviderSchema.catch(DEFAULT_PROVIDER_VALUE),
  transport: providerTransportSchema.catch(DEFAULT_PROVIDER_TRANSPORT),
});

export const llmProviderConfigSchema = z.object({
  provider: llmProviderSchema.catch(DEFAULT_PROVIDER_VALUE),
  transport: providerTransportSchema.catch(DEFAULT_PROVIDER_TRANSPORT),
});

export const ttsProviderConfigSchema = z.object({
  provider: ttsProviderSchema.catch(DEFAULT_PROVIDER_VALUE),
  transport: providerTransportSchema.catch(DEFAULT_PROVIDER_TRANSPORT),
});

export const providerSelectionSchema = z.object({
  stt: sttProviderConfigSchema,
  llm: llmProviderConfigSchema,
  tts: ttsProviderConfigSchema,
});

export type InterviewModeId = z.infer<typeof interviewModeSchema>;
export type ProviderFieldId = z.infer<typeof providerFieldSchema>;
export type ProviderTransportValue = z.infer<typeof providerTransportSchema>;
export type ProviderSelectionValue = z.infer<typeof providerSelectionSchema>;
