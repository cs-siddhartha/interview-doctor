"use server";

import { createHmac } from "node:crypto";
import { z } from "zod";

import { requireAppSession } from "@/lib/auth";

const TOKEN_LIFETIME_SECONDS = 60;

export async function getRealtimeAccessToken(sessionId: string) {
  await requireAppSession();
  const validatedSessionId = z.uuid().parse(sessionId);
  const secret = process.env.BACKEND_API_TOKEN;
  if (!secret) {
    throw new Error("Realtime access is not configured.");
  }

  const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS;
  const signature = createHmac("sha256", secret)
    .update(`${validatedSessionId}:${expiresAt}`)
    .digest("hex");
  return `${expiresAt}.${signature}`;
}
