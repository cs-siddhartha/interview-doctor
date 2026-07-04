import { SESSION_API } from "@/constants/api";
import {
  createSessionRequestSchema,
  createSessionResponseSchema,
  type CreateSessionRequest,
} from "@/lib/schemas/session";

function getApiBaseUrl() {
  return (
    process.env[SESSION_API.apiBaseUrlEnv] ??
    process.env[SESSION_API.publicApiBaseUrlEnv] ??
    SESSION_API.defaultBaseUrl
  );
}

export async function createSession(request: CreateSessionRequest) {
  const body = createSessionRequestSchema.parse(request);
  const response = await fetch(`${getApiBaseUrl()}${SESSION_API.sessionsPath}`, {
    method: SESSION_API.method,
    headers: {
      [SESSION_API.contentTypeHeader]: SESSION_API.jsonContentType,
    },
    body: JSON.stringify(body),
    cache: SESSION_API.fetchCache,
  });

  if (!response.ok) {
    throw new Error(`${SESSION_API.createErrorPrefix} ${response.status}`);
  }

  const payload = createSessionResponseSchema.parse(await response.json());

  return payload.data;
}
