import {
  createSessionRequestSchema,
  createSessionResponseSchema,
  type CreateSessionRequest,
} from "@/lib/schemas/session";

function getApiBaseUrl() {
  return (
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:8000"
  );
}

export async function createSession(request: CreateSessionRequest) {
  const body = createSessionRequestSchema.parse(request);
  const response = await fetch(`${getApiBaseUrl()}/api/v1/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.status}`);
  }

  const payload = createSessionResponseSchema.parse(await response.json());

  return payload.data;
}
