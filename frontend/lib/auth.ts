import "server-only";

import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME, verifyAppSessionToken } from "@/lib/auth-token";

export async function requireAppSession() {
  const cookieStore = await cookies();
  if (!verifyAppSessionToken(cookieStore.get(AUTH_COOKIE_NAME)?.value)) {
    throw new Error("Authentication required.");
  }
}
