import { z } from "zod";

import { transcriptTurnSchema } from "@/lib/schemas/session";

export const realtimeServerEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("session.ready") }),
  z.object({ type: z.literal("turn.started") }),
  z.object({
    type: z.literal("stt.partial"),
    text: z.string(),
  }),
  z.object({
    type: z.literal("stt.final"),
    text: z.string(),
  }),
  z.object({ type: z.literal("stt.speech_end") }),
  z.object({
    type: z.literal("interviewer.text"),
    text: z.string(),
  }),
  z.object({
    type: z.literal("interviewer.audio.start"),
    sampleRate: z.number().int().positive(),
  }),
  z.object({ type: z.literal("interviewer.audio.end") }),
  z.object({
    type: z.literal("interviewer.audio.error"),
    message: z.string(),
  }),
  z.object({
    type: z.literal("turn.completed"),
    candidateTurn: transcriptTurnSchema,
    aiTurn: transcriptTurnSchema,
    state: z.string(),
  }),
  z.object({ type: z.literal("turn.empty") }),
  z.object({ type: z.literal("session.ended") }),
  z.object({
    type: z.literal("error"),
    message: z.string(),
  }),
]);

export type RealtimeServerEvent = z.infer<typeof realtimeServerEventSchema>;
