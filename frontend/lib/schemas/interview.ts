import { z } from "zod";

export const interviewModeSchema = z.enum(["resume", "domain", "dsa"]);
export const providerFieldSchema = z.enum(["stt", "llm", "tts"]);

export const sttProviderSchema = z.enum([
  "mock",
  "deepgram",
  "smallest-ai",
  "whisper",
]);

export const llmProviderSchema = z.enum(["mock", "openai", "anthropic"]);

export const ttsProviderSchema = z.enum([
  "mock",
  "cartesia",
  "elevenlabs",
  "smallest-ai",
]);

export const providerSelectionSchema = z.object({
  stt: sttProviderSchema.catch("mock"),
  llm: llmProviderSchema.catch("mock"),
  tts: ttsProviderSchema.catch("mock"),
});

export type InterviewModeId = z.infer<typeof interviewModeSchema>;
export type ProviderFieldId = z.infer<typeof providerFieldSchema>;
export type ProviderSelectionValue = z.infer<typeof providerSelectionSchema>;
