"use server";

import { SESSION_COPY } from "@/constants/session";
import { endSession } from "@/lib/api/sessions";

export async function endInterviewSession(sessionId: string) {
  console.info("[frontend.action] ending interview", { sessionId });
  try {
    const data = await endSession(sessionId);
    console.info("[frontend.action] interview ended", { sessionId });
    return { data, error: null };
  } catch (error) {
    console.error("[frontend.action] interview end failed", { sessionId, error });
    return {
      data: null,
      error:
        error instanceof Error ? error.message : SESSION_COPY.endSessionError,
    };
  }
}
