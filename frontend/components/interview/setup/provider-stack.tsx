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
    <Card className="h-fit rounded-none shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconSettings className="size-4" aria-hidden="true" />
          {SESSION_COPY.providerStackTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3">
          {providerFields.map((field) => (
            <div
              key={field.id}
              className="grid gap-1 border border-border bg-background p-3"
            >
              <dt className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                {providerLabels[field.id]}
              </dt>
              <dd className="text-sm font-medium">
                {providers[field.id].label}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
