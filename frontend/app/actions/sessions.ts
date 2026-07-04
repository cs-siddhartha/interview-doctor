"use server";

import { redirect } from "next/navigation";

import { createSession } from "@/lib/api/sessions";
import { providerFields, type ProviderFieldId } from "@/lib/interview-options";
import {
  interviewModeSchema,
  providerSelectionSchema,
} from "@/lib/schemas/interview";
import { setupFormSchema } from "@/lib/schemas/session";

const ignoredSetupKeys = new Set(["mode", "stt", "llm", "tts", "resume"]);

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
  return interviewModeSchema.parse(formData.get("mode"));
}

function readProviders(formData: FormData): Record<ProviderFieldId, string> {
  const providers = providerFields.reduce(
    (providers, field) => {
      providers[field.id] = readString(formData, field.id) || "mock";
      return providers;
    },
    {} as Record<ProviderFieldId, string>,
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
  providers: Record<ProviderFieldId, string>,
  setup: Record<string, string>,
) {
  const params = new URLSearchParams({ sessionId });

  for (const field of providerFields) {
    params.set(field.id, providers[field.id]);
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
