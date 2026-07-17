import {
  PROVIDER_TRANSPORT_OPTIONS,
} from "@/constants/providers";
import {
  type ProviderFieldId,
  type ProviderOption,
  providerFields,
  providerOptions,
} from "@/lib/interview-options";
import {
  providerTransportSchema,
  type ProviderSelectionValue,
  type ProviderTransportValue,
} from "@/lib/schemas/interview";
import {
  searchParamsSchema,
  searchParamValueSchema,
  type SearchParamsRecord,
} from "@/lib/schemas/session";

export type ProviderSelectionItem = ProviderOption & {
  transport: ProviderTransportValue;
  transportLabel: string;
};

export type ProviderSelection = Record<ProviderFieldId, ProviderSelectionItem>;

function readSearchValue(
  searchParams: SearchParamsRecord,
  key: ProviderFieldId,
) {
  return searchParamValueSchema.parse(searchParams[key]);
}

function resolveProviderValue(fieldId: ProviderFieldId, value?: string) {
  const fallback = providerOptions[fieldId][0];

  return (
    providerOptions[fieldId].find((provider) => provider.value === value) ??
    fallback
  );
}

function readTransportValue(
  searchParams: SearchParamsRecord,
  key: `${ProviderFieldId}Transport`,
) {
  const value = searchParamValueSchema.parse(searchParams[key]);

  return value ? providerTransportSchema.parse(value) : undefined;
}

// Converts transport ids into display labels so provider panels can show the
// selected API path without duplicating label lookup logic.
function resolveTransportLabel(transport: ProviderTransportValue) {
  return (
    PROVIDER_TRANSPORT_OPTIONS.find((option) => option.value === transport)
      ?.label ?? transport
  );
}

// Converts route search params into the stable provider contract that setup
// forms and later backend session creation can share.
export function resolveProviderSelection(searchParams: SearchParamsRecord) {
  const query = searchParamsSchema.parse(searchParams);

  return providerFields.reduce<ProviderSelection>((selection, field) => {
    const provider = resolveProviderValue(
      field.id,
      readSearchValue(query, field.id),
    );
    const transport =
      readTransportValue(query, `${field.id}Transport`) ??
      provider.defaultTransport;

    selection[field.id] = {
      ...provider,
      transport,
      transportLabel: resolveTransportLabel(transport),
    };

    return selection;
  }, {} as ProviderSelection);
}

// Converts stored backend provider ids into display-ready labels so fetched
// sessions and setup query params share the same provider rendering contract.
export function resolveProviderSelectionFromValues(
  values: ProviderSelectionValue,
) {
  return providerFields.reduce<ProviderSelection>((selection, field) => {
    const provider = resolveProviderValue(field.id, values[field.id].provider);

    selection[field.id] = {
      ...provider,
      transport: values[field.id].transport,
      transportLabel: resolveTransportLabel(values[field.id].transport),
    };

    return selection;
  }, {} as ProviderSelection);
}
