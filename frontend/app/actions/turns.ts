"use server";

import { createTurn } from "@/lib/api/sessions";
import { SESSION_COPY } from "@/constants/session";

// Sends one recorded browser audio payload through the backend turn pipeline.
export async function createAudioTurn(
  sessionId: string,
  audioBase64: string,
  mimeType: string,
) {
  try {
    return {
      data: await createTurn(sessionId, {
        audio_base64: audioBase64,
        mime_type: mimeType,
      }),
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : SESSION_COPY.turnErrorMessage,
    };
  }
}
