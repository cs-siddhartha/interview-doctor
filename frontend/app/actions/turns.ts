"use server";

import { createTurn } from "@/lib/api/sessions";
import { SESSION_COPY } from "@/constants/session";

// Sends one recorded browser audio payload through the backend turn pipeline.
export async function createAudioTurn(
  sessionId: string,
  audioBase64: string,
  mimeType: string,
) {
  console.info("[frontend.action] audio turn received", {
    sessionId,
    mimeType,
    encodedAudioChars: audioBase64.length,
  });
  try {
    const data = await createTurn(sessionId, {
        audio_base64: audioBase64,
        mime_type: mimeType,
      });
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
