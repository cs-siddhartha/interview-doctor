"use server";

import { createTurn } from "@/lib/api/sessions";

export async function createMockTurn(sessionId: string) {
  return createTurn(sessionId, { audio_base64: "" });
}
