export const SESSION_API = {
  apiBaseUrlEnv: "API_BASE_URL",
  publicApiBaseUrlEnv: "NEXT_PUBLIC_API_BASE_URL",
  defaultBaseUrl: "http://localhost:8000",
  sessionsPath: "/api/v1/sessions",
  method: "POST",
  contentTypeHeader: "Content-Type",
  jsonContentType: "application/json",
  fetchCache: "no-store",
  createErrorPrefix: "Failed to create session:",
} as const;
