import {
  DOMAIN_MODE,
  DSA_MODE,
  RESUME_MODE,
} from "@/constants/interview-modes";
import { PROVIDER_FIELD_IDS } from "@/constants/providers";
import { QUERY_PARAM_NAMES } from "@/constants/routes";
import {
  DOMAIN_SESSION_SETUP_FIELDS,
  DSA_SESSION_SETUP_FIELDS,
  RESUME_SESSION_SETUP_FIELDS,
  SESSION_COPY,
} from "@/constants/session";
import {
  type InterviewModeId,
  type ProviderFieldId,
} from "@/lib/interview-options";
import { type ProviderSelection } from "@/lib/provider-selection";
import {
  searchParamsSchema,
  searchParamValueSchema,
  type SearchParamsRecord,
} from "@/lib/schemas/session";

export type SessionSetupItem = {
  label: string;
  value: string;
};

const setupFieldsByMode: Record<
  InterviewModeId,
  { key: string; label: string }[]
> = {
  [RESUME_MODE.id]: [...RESUME_SESSION_SETUP_FIELDS],
  [DOMAIN_MODE.id]: [...DOMAIN_SESSION_SETUP_FIELDS],
  [DSA_MODE.id]: [...DSA_SESSION_SETUP_FIELDS],
};

const providerKeys = new Set<ProviderFieldId>(PROVIDER_FIELD_IDS);

// Builds the setup summary from stored session setup values so the session page
// reflects backend state instead of stale setup fields left in the URL.
export function resolveSessionSetupFromValues(
  mode: InterviewModeId,
  setup: Record<string, string>,
) {
  return setupFieldsByMode[mode].map(({ key, label }) => ({
    label,
    value: formatSearchValue(setup[key]),
  }));
}

// Preserves provider selections when linking back to setup while still deriving
// those values from the fetched session rather than the original route query.
export function buildProviderQueryFromSelection(providers: ProviderSelection) {
  const params = new URLSearchParams();

  for (const key of providerKeys) {
    params.set(key, providers[key].value);
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

// Reads the optional backend-created session id from route query params so
// pages do not need inline type narrowing for repeated Next search param shapes.
export function resolveSessionId(searchParams: SearchParamsRecord) {
  const query = searchParamsSchema.parse(searchParams);
  const sessionId = readSearchValue(query, QUERY_PARAM_NAMES.sessionId);

  return sessionId || undefined;
}

function readSearchValue(searchParams: SearchParamsRecord, key: string) {
  return searchParamValueSchema.parse(searchParams[key]);
}


function formatSearchValue(value?: string) {
  if (!value) {
    return SESSION_COPY.missingSetupValue;
  }

  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
