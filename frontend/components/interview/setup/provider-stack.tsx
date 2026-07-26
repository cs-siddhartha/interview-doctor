import { IconSettings } from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card className="h-fit overflow-hidden rounded-[1.5rem] border-black/10 bg-[#171a1c] py-0 text-white shadow-none">
      <CardHeader className="border-b border-white/10 px-5 py-5">
        <CardTitle className="flex items-center gap-2 text-lg">
          <IconSettings className="size-4 text-[#d7ff66]" aria-hidden="true" />
          {SESSION_COPY.providerStackTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-4">
        <dl className="grid gap-2">
          {providerFields.map((field) => (
            <div key={field.id} className="grid gap-1 rounded-xl bg-white/5 p-4">
              <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/35">
                {providerLabels[field.id]}
              </dt>
              <dd className="text-sm font-semibold text-white/85">
                {providers[field.id].label}
                <span className="ml-2 text-xs font-normal text-white/35">
                  {providers[field.id].transportLabel}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
