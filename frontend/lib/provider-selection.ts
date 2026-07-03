import {
  type ProviderFieldId,
  type ProviderOption,
  providerFields,
  providerOptions,
} from "@/lib/interview-options";

export type SearchParamsRecord = Record<
  string,
  string | string[] | undefined
>;

export type ProviderSelection = Record<ProviderFieldId, ProviderOption>;

function readSearchValue(
  searchParams: SearchParamsRecord,
  key: ProviderFieldId,
) {
  const value = searchParams[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
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
  return providerFields.reduce<ProviderSelection>((selection, field) => {
    selection[field.id] = resolveProviderValue(
      field.id,
      readSearchValue(searchParams, field.id),
    );

    return selection;
  }, {} as ProviderSelection);
}
