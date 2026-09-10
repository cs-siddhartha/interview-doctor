"use server";

import { createTurn } from "@/lib/api/sessions";
import { requireAppSession } from "@/lib/auth";
import { SESSION_COPY } from "@/constants/session";
import { createTurnRequestSchema } from "@/lib/schemas/session";

// Sends one recorded browser audio payload through the backend turn pipeline.
export async function createAudioTurn(
  sessionId: string,
  audioBase64: string,
  mimeType: string,
) {
  await requireAppSession();
  console.info("[frontend.action] audio turn received", {
    sessionId,
    mimeType,
    encodedAudioChars: audioBase64.length,
  });
  try {
    const request = createTurnRequestSchema.parse({
      audio_base64: audioBase64,
      mime_type: mimeType,
    });
    const data = await createTurn(sessionId, request);
    console.info("[frontend.action] audio turn completed", { sessionId });
    return { data, error: null };
  } catch (error) {
    console.error("[frontend.action] audio turn failed", { sessionId, error });
    return {
      data: null,
      error:
        error instanceof Error ? error.message : SESSION_COPY.turnErrorMessage,
    };
  }
}
