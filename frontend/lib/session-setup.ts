import {
  type InterviewModeId,
  type ProviderFieldId,
} from "@/lib/interview-options";
import { type SearchParamsRecord } from "@/lib/provider-selection";

export type SessionSetupItem = {
  label: string;
  value: string;
};

const setupFieldsByMode: Record<
  InterviewModeId,
  { key: string; label: string }[]
> = {
  resume: [
    { key: "targetRole", label: "Target role" },
    { key: "intensity", label: "Grilling intensity" },
  ],
  domain: [
    { key: "domain", label: "Domain" },
    { key: "seniority", label: "Seniority" },
    { key: "style", label: "Style" },
  ],
  dsa: [
    { key: "topic", label: "Topic" },
    { key: "difficulty", label: "Difficulty" },
    { key: "language", label: "Language" },
  ],
};

const providerKeys = new Set<ProviderFieldId>(["stt", "llm", "tts"]);

// Builds a display-ready setup summary from mode-specific query params so the
// mock session can show what will later become backend session context.
export function resolveSessionSetup(
  mode: InterviewModeId,
  searchParams: SearchParamsRecord,
) {
  return setupFieldsByMode[mode].map(({ key, label }) => ({
    label,
    value: formatSearchValue(readSearchValue(searchParams, key)),
  }));
}

export function buildProviderQuery(searchParams: SearchParamsRecord) {
  const params = new URLSearchParams();

  for (const key of providerKeys) {
    const value = readSearchValue(searchParams, key);

    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

function readSearchValue(searchParams: SearchParamsRecord, key: string) {
  const value = searchParams[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}


function formatSearchValue(value?: string) {
  if (!value) {
    return "Not set";
  }

  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
