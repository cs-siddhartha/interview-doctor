import { createHmac, timingSafeEqual } from "node:crypto";

export const AUTH_COOKIE_NAME = "interview_doctor_session";
const AUTH_TOKEN_PAYLOAD = "interview-doctor-authorized";

export function createAppSessionToken(secret: string) {
  return createHmac("sha256", secret).update(AUTH_TOKEN_PAYLOAD).digest("hex");
}

export function verifyAppSessionToken(token: string | undefined) {
  const secret = process.env.APP_ACCESS_TOKEN;
  if (!secret || !token) {
    return false;
  }

  const expected = createAppSessionToken(secret);
  const actualBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export function verifyAppPassphrase(passphrase: string) {
  const expected = process.env.APP_ACCESS_TOKEN;
  if (!expected) {
    return false;
  }

  const actualBuffer = Buffer.from(passphrase);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}
