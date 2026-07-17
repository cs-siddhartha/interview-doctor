"use server";

import { redirect } from "next/navigation";

import { createSession } from "@/lib/api/sessions";
import { QUERY_PARAM_NAMES } from "@/constants/routes";
import { FORM_FIELD_NAMES } from "@/constants/setup";
import {
  DEFAULT_PROVIDER_VALUE,
  DEFAULT_PROVIDER_TRANSPORT,
  PROVIDER_FIELD_IDS,
  PROVIDER_TRANSPORT_FIELD_IDS,
} from "@/constants/providers";
import { providerFields } from "@/lib/interview-options";
import {
  interviewModeSchema,
  providerSelectionSchema,
  type ProviderSelectionValue,
} from "@/lib/schemas/interview";
import { setupFormSchema } from "@/lib/schemas/session";

const ignoredSetupKeys = new Set<string>([
  FORM_FIELD_NAMES.mode,
  ...PROVIDER_FIELD_IDS,
  ...PROVIDER_TRANSPORT_FIELD_IDS,
  FORM_FIELD_NAMES.resume,
]);

export async function createSessionFromSetup(formData: FormData) {
  const parsedForm = setupFormSchema.parse({
    mode: readMode(formData),
    providers: readProviders(formData),
    setup: readSetup(formData),
  });
  const session = await createSession(parsedForm);
  const params = buildSessionParams(
    session.id,
    parsedForm.providers,
    parsedForm.setup,
  );

  redirect(`/${parsedForm.mode}/session?${params.toString()}`);
}

function readMode(formData: FormData) {
  return interviewModeSchema.parse(formData.get(FORM_FIELD_NAMES.mode));
}

function readProviders(formData: FormData): ProviderSelectionValue {
  const providers = providerFields.reduce(
    (providers, field) => {
      providers[field.id] = {
        provider: readString(formData, field.id) || DEFAULT_PROVIDER_VALUE,
        transport:
          readString(formData, `${field.id}Transport`) ||
          DEFAULT_PROVIDER_TRANSPORT,
      };
      return providers;
    },
    {} as Record<string, { provider: string; transport: string }>,
  );

  return providerSelectionSchema.parse(providers);
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
