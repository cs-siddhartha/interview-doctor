"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  AUTH_COOKIE_NAME,
  createAppSessionToken,
  verifyAppPassphrase,
} from "@/lib/auth-token";

export type LoginState = { error: string | null };

export async function login(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const passphrase = String(formData.get("passphrase") ?? "");
  if (!process.env.APP_ACCESS_TOKEN) {
    return { error: "APP_ACCESS_TOKEN is not configured." };
  }
  if (!verifyAppPassphrase(passphrase)) {
    return { error: "Incorrect access passphrase." };
  }

  const cookieStore = await cookies();
  cookieStore.set(
    AUTH_COOKIE_NAME,
    createAppSessionToken(process.env.APP_ACCESS_TOKEN),
    {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    },
  );
  redirect("/");
}
