import { z } from "zod";

import {
  DOMAIN_MODE,
  ALGORITHMS_MODE,
  RESUME_MODE,
  SYSTEM_DESIGN_MODE,
} from "@/constants/interview-modes";
import {
  DOMAIN_SETUP_FIELDS,
  ALGORITHMS_SETUP_FIELDS,
  FORM_FIELD_NAMES,
  RESUME_SETUP_FIELDS,
  SYSTEM_DESIGN_SETUP_FIELDS,
} from "@/constants/setup";
import {
  DEFAULT_SESSION_TRANSPORT,
} from "@/constants/providers";
import {
  interviewModeSchema,
  providerSelectionSchema,
  sessionTransportSchema,
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
  .max(500)
  .optional()
  .transform((value) => value ?? "");

const requiredSetupValueSchema = z.string().trim().min(1).max(500);
const supportedAudioMimeTypes = [
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/webm",
  "audio/webm;codecs=opus",
] as const;

export const resumeSetupSchema = z.object({
  [RESUME_SETUP_FIELDS.targetRole.name]: requiredSetupValueSchema,
  [RESUME_SETUP_FIELDS.intensity.name]: z.enum(RESUME_SETUP_FIELDS.intensity.options),
  [FORM_FIELD_NAMES.resumeDocumentId]: requiredSetupValueSchema,
});

export const domainSetupSchema = z.object({
  [DOMAIN_SETUP_FIELDS.topic.name]: requiredSetupValueSchema,
  [DOMAIN_SETUP_FIELDS.seniority.name]: z.enum(DOMAIN_SETUP_FIELDS.seniority.options),
  [DOMAIN_SETUP_FIELDS.style.name]: z.enum(DOMAIN_SETUP_FIELDS.style.options),
});

export const algorithmsSetupSchema = z.object({
  [ALGORITHMS_SETUP_FIELDS.topic.name]: z.enum(
    ALGORITHMS_SETUP_FIELDS.topic.options,
  ),
  [ALGORITHMS_SETUP_FIELDS.difficulty.name]: z.enum(
    ALGORITHMS_SETUP_FIELDS.difficulty.options,
  ),
  [ALGORITHMS_SETUP_FIELDS.language.name]: requiredSetupValueSchema,
});

export const systemDesignSetupSchema = z.object({
  [SYSTEM_DESIGN_SETUP_FIELDS.problem.name]: setupValueSchema,
  [SYSTEM_DESIGN_SETUP_FIELDS.seniority.name]: z.enum(
    SYSTEM_DESIGN_SETUP_FIELDS.seniority.options,
  ),
});

export const setupFormSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal(RESUME_MODE.id),
    transport: sessionTransportSchema,
    providers: providerSelectionSchema,
    setup: resumeSetupSchema,
  }),
  z.object({
    mode: z.literal(DOMAIN_MODE.id),
    transport: sessionTransportSchema,
    providers: providerSelectionSchema,
    setup: domainSetupSchema,
  }),
  z.object({
    mode: z.literal(ALGORITHMS_MODE.id),
    transport: sessionTransportSchema,
    providers: providerSelectionSchema,
    setup: algorithmsSetupSchema,
  }),
  z.object({
    mode: z.literal(SYSTEM_DESIGN_MODE.id),
    transport: sessionTransportSchema,
    providers: providerSelectionSchema,
    setup: systemDesignSetupSchema,
  }),
]);

export const createSessionRequestSchema = setupFormSchema;

export const transcriptTurnSchema = z.object({
  speaker: z.string().min(1),
  text: z.string().min(1),
  created_at: z.string(),
});

export const interviewReportSchema = z.object({
  overall_score: z.number().int().min(0).max(100),
  summary: z.string().min(1),
  categories: z.array(
    z.object({
      name: z.string().min(1),
      score: z.number().int().min(1).max(5),
      rationale: z.string().min(1),
      evidence: z.array(
        z.object({
          turn_index: z.number().int().nonnegative(),
          quote: z.string().min(1),
        }),
      ),
    }),
  ),
  strengths: z.array(z.string().min(1)),
  improvements: z.array(
    z.object({
      area: z.string().min(1),
      action: z.string().min(1),
    }),
  ),
});

export const createSessionResponseSchema = z.object({
  data: z.object({
    id: z.string().min(1),
    mode: interviewModeSchema,
    transport: sessionTransportSchema.catch(DEFAULT_SESSION_TRANSPORT),
    providers: providerSelectionSchema,
    setup: z.record(z.string(), z.string()),
    state: z.string(),
    transcript: z.array(transcriptTurnSchema).default([]),
    opening_audio_base64: z.string().default(""),
    opening_audio_error: z.string().nullable().default(null),
    report: interviewReportSchema.nullable().default(null),
    report_error: z.string().nullable().default(null),
    version: z.number().int().nonnegative().default(0),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

export const resumeDocumentResponseSchema = z.object({
  data: z.object({
    id: z.string().min(1),
    filename: z.string().min(1),
    page_count: z.number().int().positive(),
    chunk_count: z.number().int().positive(),
    created_at: z.string(),
  }),
});

export const createTurnRequestSchema = z.object({
  audio_base64: z.string().min(1).max(8 * 1024 * 1024),
  mime_type: z.enum(supportedAudioMimeTypes),
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
  audio_error: z.string().nullable().default(null),
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
export type ResumeDocument = z.infer<
  typeof resumeDocumentResponseSchema
>["data"];
export type TurnResult = z.infer<typeof turnResultSchema>;
export type InterviewReport = z.infer<typeof interviewReportSchema>;
export type TranscriptTurn = z.infer<
  typeof createSessionResponseSchema
>["data"]["transcript"][number];
