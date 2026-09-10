import { SESSION_API } from "@/constants/api";

// Builds a browser-reachable WebSocket URL without leaking server-only API
// addresses or provider credentials into the client bundle.
export function getRealtimeSessionUrl(sessionId: string, token: string) {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? SESSION_API.defaultBaseUrl;
  const url = new URL(
    `${SESSION_API.sessionsPath}/${encodeURIComponent(sessionId)}${SESSION_API.realtimeSuffix}`,
    apiBaseUrl,
  );

  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("token", token);

  return url.toString();
}
