import { DEFAULT_PROVIDER_TRANSPORT } from "@/constants/providers";
import {
  type ProviderFieldId,
  type ProviderOption,
  providerFields,
  providerOptions,
} from "@/lib/interview-options";
import {
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

// Converts route search params into the stable provider contract that setup
// forms and later backend session creation can share.
export function resolveProviderSelection(searchParams: SearchParamsRecord) {
  const query = searchParamsSchema.parse({ ...searchParams });

  return providerFields.reduce<ProviderSelection>((selection, field) => {
    const provider = resolveProviderValue(
      field.id,
      readSearchValue(query, field.id),
    );

    selection[field.id] = {
      ...provider,
      transport: DEFAULT_PROVIDER_TRANSPORT,
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
    };

    return selection;
  }, {} as ProviderSelection);
}
