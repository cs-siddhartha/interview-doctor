import { z } from "zod";

import {
  DEFAULT_PROVIDER_VALUE,
  LLM_PROVIDER_VALUES,
  PROVIDER_FIELD_IDS,
  STT_PROVIDER_VALUES,
  TTS_PROVIDER_VALUES,
} from "@/constants/providers";
import { INTERVIEW_MODE_IDS } from "@/constants/interview-modes";

export const interviewModeSchema = z.enum(INTERVIEW_MODE_IDS);
export const providerFieldSchema = z.enum(PROVIDER_FIELD_IDS);

export const sttProviderSchema = z.enum(STT_PROVIDER_VALUES);
export const llmProviderSchema = z.enum(LLM_PROVIDER_VALUES);
export const ttsProviderSchema = z.enum(TTS_PROVIDER_VALUES);

export const providerSelectionSchema = z.object({
  stt: sttProviderSchema.catch(DEFAULT_PROVIDER_VALUE),
  llm: llmProviderSchema.catch(DEFAULT_PROVIDER_VALUE),
  tts: ttsProviderSchema.catch(DEFAULT_PROVIDER_VALUE),
});

export type InterviewModeId = z.infer<typeof interviewModeSchema>;
export type ProviderFieldId = z.infer<typeof providerFieldSchema>;
export type ProviderSelectionValue = z.infer<typeof providerSelectionSchema>;
