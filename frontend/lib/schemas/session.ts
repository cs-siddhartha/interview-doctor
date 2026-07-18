import { z } from "zod";

import {
  DOMAIN_MODE,
  DSA_MODE,
  RESUME_MODE,
} from "@/constants/interview-modes";
import {
  DOMAIN_SETUP_FIELDS,
  DSA_SETUP_FIELDS,
  RESUME_SETUP_FIELDS,
} from "@/constants/setup";
import {
  interviewModeSchema,
  providerSelectionSchema,
} from "@/lib/schemas/interview";

export const searchParamValueSchema = z
  .union([z.string(), z.array(z.string()), z.undefined()])
  .transform((value) => {
    if (Array.isArray(value)) {
      return value[0] ?? "";
    }

    return value ?? "";
  });

export const searchParamsSchema = z.record(
  z.string(),
  z.union([z.string(), z.array(z.string()), z.undefined()]),
);

export const setupValueSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => value ?? "");

const requiredSetupValueSchema = z.string().trim().min(1);

export const resumeSetupSchema = z.object({
  [RESUME_SETUP_FIELDS.targetRole.name]: requiredSetupValueSchema,
  [RESUME_SETUP_FIELDS.intensity.name]: z.enum(RESUME_SETUP_FIELDS.intensity.options),
});

export const domainSetupSchema = z.object({
  [DOMAIN_SETUP_FIELDS.topic.name]: requiredSetupValueSchema,
  [DOMAIN_SETUP_FIELDS.seniority.name]: z.enum(DOMAIN_SETUP_FIELDS.seniority.options),
  [DOMAIN_SETUP_FIELDS.style.name]: z.enum(DOMAIN_SETUP_FIELDS.style.options),
});

export const dsaSetupSchema = z.object({
  [DSA_SETUP_FIELDS.topic.name]: z.enum(DSA_SETUP_FIELDS.topic.options),
  [DSA_SETUP_FIELDS.difficulty.name]: z.enum(DSA_SETUP_FIELDS.difficulty.options),
  [DSA_SETUP_FIELDS.language.name]: requiredSetupValueSchema,
});

export const setupFormSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal(RESUME_MODE.id),
    providers: providerSelectionSchema,
    setup: resumeSetupSchema,
  }),
  z.object({
    mode: z.literal(DOMAIN_MODE.id),
    providers: providerSelectionSchema,
    setup: domainSetupSchema,
  }),
  z.object({
    mode: z.literal(DSA_MODE.id),
    providers: providerSelectionSchema,
    setup: dsaSetupSchema,
  }),
]);

export const createSessionRequestSchema = setupFormSchema;

export const createSessionResponseSchema = z.object({
  data: z.object({
    id: z.string().min(1),
    mode: interviewModeSchema,
    providers: providerSelectionSchema,
    setup: z.record(z.string(), z.string()),
    state: z.string(),
    transcript: z
      .array(
        z.object({
          speaker: z.string().min(1),
          text: z.string().min(1),
          created_at: z.string(),
        }),
      )
      .default([]),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

export const createTurnRequestSchema = z.object({
  audio_base64: z.string(),
  mime_type: z.string().min(1),
});

export const turnResultSchema = z.object({
  session_id: z.string().min(1),
  candidate_turn: z.object({
    speaker: z.string().min(1),
    text: z.string().min(1),
    created_at: z.string(),
  }),
  ai_turn: z.object({
    speaker: z.string().min(1),
    text: z.string().min(1),
    created_at: z.string(),
  }),
  audio_base64: z.string(),
  state: z.string(),
});

export const createTurnResponseSchema = z.object({
  data: turnResultSchema,
});

export const apiErrorResponseSchema = z.object({
  detail: z.string().min(1),
});

export type SearchParamsRecord = z.input<typeof searchParamsSchema>;
export type CreateSessionRequest = z.infer<typeof createSessionRequestSchema>;
export type CreateTurnRequest = z.infer<typeof createTurnRequestSchema>;
export type TurnResult = z.infer<typeof turnResultSchema>;
export type TranscriptTurn = z.infer<
  typeof createSessionResponseSchema
>["data"]["transcript"][number];
