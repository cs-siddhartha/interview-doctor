"use server";

import { SESSION_COPY } from "@/constants/session";
import { endSession } from "@/lib/api/sessions";

export async function endInterviewSession(sessionId: string) {
  try {
    return {
      data: await endSession(sessionId),
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : SESSION_COPY.endSessionError,
    };
  }
}
