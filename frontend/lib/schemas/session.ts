import { z } from "zod";

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

export const createSessionRequestSchema = z.object({
  mode: interviewModeSchema,
  providers: providerSelectionSchema,
  setup: z.record(z.string(), z.string()),
});

export const createSessionResponseSchema = z.object({
  data: z.object({
    id: z.string().min(1),
    mode: interviewModeSchema,
    providers: providerSelectionSchema,
    setup: z.record(z.string(), z.string()),
    state: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

export const setupFormSchema = z.object({
  mode: interviewModeSchema,
  providers: providerSelectionSchema,
  setup: z.record(z.string(), z.string()),
});

export type SearchParamsRecord = z.input<typeof searchParamsSchema>;
export type CreateSessionRequest = z.infer<typeof createSessionRequestSchema>;
