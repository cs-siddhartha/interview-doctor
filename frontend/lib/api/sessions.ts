import { SESSION_API } from "@/constants/api";
import {
  apiErrorResponseSchema,
  createSessionRequestSchema,
  createSessionResponseSchema,
  createTurnRequestSchema,
  createTurnResponseSchema,
  resumeDocumentResponseSchema,
  type CreateSessionRequest,
  type CreateTurnRequest,
} from "@/lib/schemas/session";

export async function uploadResume(resume: File) {
  const startedAt = Date.now();
  console.info("[frontend.api] resume upload started", {
    contentType: resume.type,
    bytes: resume.size,
  });
  const body = new FormData();
  body.set("resume", resume);
  const response = await fetch(`${getApiBaseUrl()}${SESSION_API.resumesPath}`, {
    method: SESSION_API.method,
    body,
    cache: SESSION_API.fetchCache,
  });

  if (!response.ok) {
    console.error("[frontend.api] resume upload failed", {
      status: response.status,
      durationMs: Date.now() - startedAt,
    });
    throw new Error(
      await readApiErrorMessage(response, SESSION_API.resumeErrorPrefix),
    );
  }

  const payload = resumeDocumentResponseSchema.parse(await response.json());
  console.info("[frontend.api] resume upload completed", {
    documentId: payload.data.id,
    status: response.status,
    durationMs: Date.now() - startedAt,
  });

  return payload.data;
}

function getApiBaseUrl() {
  return (
    process.env[SESSION_API.apiBaseUrlEnv] ??
    process.env[SESSION_API.publicApiBaseUrlEnv] ??
    SESSION_API.defaultBaseUrl
  );
}

export async function createSession(request: CreateSessionRequest) {
  const startedAt = Date.now();
  const body = createSessionRequestSchema.parse(request);
  console.info("[frontend.api] session creation started", {
    mode: body.mode,
    transport: body.transport,
    providers: {
      stt: body.providers.stt.provider,
      llm: body.providers.llm.provider,
      tts: body.providers.tts.provider,
    },
  });
  const response = await fetch(`${getApiBaseUrl()}${SESSION_API.sessionsPath}`, {
    method: SESSION_API.method,
    headers: {
      [SESSION_API.contentTypeHeader]: SESSION_API.jsonContentType,
    },
    body: JSON.stringify(body),
    cache: SESSION_API.fetchCache,
  });

  if (!response.ok) {
    console.error("[frontend.api] session creation failed", {
      status: response.status,
      durationMs: Date.now() - startedAt,
    });
    throw new Error(await readApiErrorMessage(response, SESSION_API.createErrorPrefix));
  }

  const payload = createSessionResponseSchema.parse(await response.json());
  console.info("[frontend.api] session creation completed", {
    sessionId: payload.data.id,
    status: response.status,
    durationMs: Date.now() - startedAt,
  });

  return payload.data;
}

// Loads the short-lived backend session by id so session pages use Redis state
// as the source of truth instead of reconstructing setup/provider data from URLs.
export async function getSession(sessionId: string) {
  const startedAt = Date.now();
  console.info("[frontend.api] session fetch started", { sessionId });
  const response = await fetch(
    `${getApiBaseUrl()}${SESSION_API.sessionsPath}/${sessionId}`,
    {
      cache: SESSION_API.fetchCache,
    },
  );

  if (response.status === 404) {
    console.warn("[frontend.api] session not found", {
      sessionId,
      durationMs: Date.now() - startedAt,
    });
    return null;
  }

  if (!response.ok) {
    console.error("[frontend.api] session fetch failed", {
      sessionId,
      status: response.status,
      durationMs: Date.now() - startedAt,
    });
    throw new Error(await readApiErrorMessage(response, SESSION_API.getErrorPrefix));
  }

  const payload = createSessionResponseSchema.parse(await response.json());
  console.info("[frontend.api] session fetch completed", {
    sessionId,
    state: payload.data.state,
    status: response.status,
    durationMs: Date.now() - startedAt,
  });

  return payload.data;
}

// Persists the terminal session state and returns the complete stored session
// so the client can render its final transcript without another request.
export async function endSession(sessionId: string) {
  const startedAt = Date.now();
  console.info("[frontend.api] session end started", { sessionId });
  const response = await fetch(
    `${getApiBaseUrl()}${SESSION_API.sessionsPath}/${sessionId}`,
    {
      method: SESSION_API.updateMethod,
      headers: {
        [SESSION_API.contentTypeHeader]: SESSION_API.jsonContentType,
      },
      body: JSON.stringify({ state: "session_end" }),
      cache: SESSION_API.fetchCache,
    },
  );

  if (!response.ok) {
    console.error("[frontend.api] session end failed", {
      sessionId,
      status: response.status,
      durationMs: Date.now() - startedAt,
    });
    throw new Error(
      await readApiErrorMessage(response, SESSION_API.endErrorPrefix),
    );
  }

  const payload = createSessionResponseSchema.parse(await response.json());
  console.info("[frontend.api] session end completed", {
    sessionId,
    state: payload.data.state,
    status: response.status,
    durationMs: Date.now() - startedAt,
  });

  return payload.data;
}

export async function createTurn(
  sessionId: string,
  request: CreateTurnRequest,
) {
  const startedAt = Date.now();
  const body = createTurnRequestSchema.parse(request);
  console.info("[frontend.api] turn submission started", {
    sessionId,
    mimeType: body.mime_type,
    encodedAudioChars: body.audio_base64.length,
  });
  const response = await fetch(
    `${getApiBaseUrl()}${SESSION_API.sessionsPath}/${sessionId}/turns`,
    {
      method: SESSION_API.method,
      headers: {
        [SESSION_API.contentTypeHeader]: SESSION_API.jsonContentType,
      },
      body: JSON.stringify(body),
      cache: SESSION_API.fetchCache,
    },
  );

  if (!response.ok) {
    console.error("[frontend.api] turn submission failed", {
      sessionId,
      status: response.status,
      durationMs: Date.now() - startedAt,
    });
    throw new Error(await readApiErrorMessage(response, SESSION_API.getErrorPrefix));
  }

  const payload = createTurnResponseSchema.parse(await response.json());
  console.info("[frontend.api] turn submission completed", {
    sessionId,
    state: payload.data.state,
    status: response.status,
    durationMs: Date.now() - startedAt,
  });

  return payload.data;
}

// Reads FastAPI error payloads so setup and session screens can display the
// actual provider/configuration failure instead of a bare HTTP status code.
async function readApiErrorMessage(response: Response, prefix: string) {
  try {
    const payload = apiErrorResponseSchema.parse(await response.json());

    return `${prefix} ${payload.detail}`;
  } catch {
    return `${prefix} ${response.status}`;
  }
}
