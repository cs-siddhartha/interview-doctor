"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createSession } from "@/lib/api/sessions";
import { QUERY_PARAM_NAMES } from "@/constants/routes";
import { FORM_FIELD_NAMES, SETUP_COPY } from "@/constants/setup";
import {
  DEFAULT_PROVIDER_TRANSPORT,
  DEFAULT_LLM_PROVIDER_VALUE,
  DEFAULT_STT_PROVIDER_VALUE,
  DEFAULT_TTS_PROVIDER_VALUE,
  PROVIDER_FIELD_IDS,
  PROVIDER_TRANSPORT_FIELD_IDS,
} from "@/constants/providers";
import { providerFields } from "@/lib/interview-options";
import {
  type ProviderFieldId,
  type ProviderSelectionValue,
} from "@/lib/schemas/interview";
import { setupFormSchema } from "@/lib/schemas/session";

export type CreateSessionActionState = {
  error: string | null;
};

export const initialCreateSessionActionState: CreateSessionActionState = {
  error: null,
};

const ignoredSetupKeys = new Set<string>([
  FORM_FIELD_NAMES.mode,
  ...PROVIDER_FIELD_IDS,
  ...PROVIDER_TRANSPORT_FIELD_IDS,
  FORM_FIELD_NAMES.resume,
]);

const defaultProviders = {
  stt: DEFAULT_STT_PROVIDER_VALUE,
  llm: DEFAULT_LLM_PROVIDER_VALUE,
  tts: DEFAULT_TTS_PROVIDER_VALUE,
} as const;

// Validates setup form data, creates the short-lived backend session, and
// returns backend configuration errors for inline setup-page rendering.
export async function createSessionFromSetup(
  _state: CreateSessionActionState,
  formData: FormData,
) {
  const parsedForm = parseSetupForm(formData);

  if (!parsedForm.success) {
    return { error: SETUP_COPY.invalidSetupMessage };
  }

  let session;

  try {
    session = await createSession(parsedForm.data);
  } catch (error) {
    return { error: getSessionCreationErrorMessage(error) };
  }

  const params = buildSessionParams(
    session.id,
    parsedForm.data.providers,
    parsedForm.data.setup,
  );

  redirect(`/${parsedForm.data.mode}/session?${params.toString()}`);
}

function parseSetupForm(formData: FormData) {
  return setupFormSchema.safeParse({
    mode: readString(formData, FORM_FIELD_NAMES.mode),
    providers: readProviders(formData),
    setup: readSetup(formData),
  });
}

function readProviders(formData: FormData) {
  const providers = providerFields.reduce(
    (providers, field) => {
      providers[field.id] = {
        provider: readString(formData, field.id) || defaultProviders[field.id],
        transport:
          readString(formData, `${field.id}Transport`) ||
          DEFAULT_PROVIDER_TRANSPORT,
      };
      return providers;
    },
    {} as Record<ProviderFieldId, { provider: string; transport: string }>,
  );

  return providers;
}

function readSetup(formData: FormData) {
  const setup: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    if (ignoredSetupKeys.has(key) || typeof value !== "string" || !value) {
      continue;
    }

    setup[key] = value;
  }

  return setup;
}

function buildSessionParams(
  sessionId: string,
  providers: ProviderSelectionValue,
  setup: Record<string, string>,
) {
  const params = new URLSearchParams({
    [QUERY_PARAM_NAMES.sessionId]: sessionId,
  });

  for (const field of providerFields) {
    params.set(field.id, providers[field.id].provider);
    params.set(`${field.id}Transport`, providers[field.id].transport);
  }

  for (const [key, value] of Object.entries(setup)) {
    params.set(key, value);
  }

  return params;
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getSessionCreationErrorMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    return SETUP_COPY.invalidSetupMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return SETUP_COPY.createSessionErrorMessage;
}
