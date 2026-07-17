"use server";

import { createTurn } from "@/lib/api/sessions";

// Sends one recorded browser audio payload through the backend turn pipeline.
export async function createAudioTurn(sessionId: string, audioBase64: string) {
  return createTurn(sessionId, { audio_base64: audioBase64 });
}
