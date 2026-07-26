import { IconSettings } from "@tabler/icons-react";

import { SidebarDetailsCard } from "@/components/interview/sidebar-details-card";
import { PROVIDER_FIELDS } from "@/constants/providers";
import { SESSION_COPY } from "@/constants/session";
import {
  type ProviderFieldId,
  providerFields,
} from "@/lib/interview-options";
import { type ProviderSelection } from "@/lib/provider-selection";

type ProviderStackProps = {
  providers: ProviderSelection;
};

const providerLabels = Object.fromEntries(
  PROVIDER_FIELDS.map(({ id, shortLabel }) => [id, shortLabel]),
) as Record<ProviderFieldId, string>;

export function ProviderStack({ providers }: ProviderStackProps) {
  return (
    <SidebarDetailsCard
      title={SESSION_COPY.providerStackTitle}
      icon={<IconSettings className="size-4 text-[#ca3f28]" aria-hidden="true" />}
    >
      <dl className="divide-y divide-black/10">
        {providerFields.map((field) => (
          <div
            key={field.id}
            className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-4 py-3"
          >
            <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-black/40">
              {providerLabels[field.id]}
            </dt>
            <dd className="min-w-0 text-right text-sm font-semibold">
              {providers[field.id].label}
              <span className="ml-1.5 font-normal text-black/40">
                · {providers[field.id].transportLabel}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </SidebarDetailsCard>
  );
}
