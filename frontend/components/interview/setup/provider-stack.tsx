import { IconSettings } from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ProviderFieldId,
  providerFields,
} from "@/lib/interview-options";
import { type ProviderSelection } from "@/lib/provider-selection";

type ProviderStackProps = {
  providers: ProviderSelection;
};

const providerLabels: Record<ProviderFieldId, string> = {
  stt: "STT",
  llm: "LLM",
  tts: "TTS",
};

export function ProviderStack({ providers }: ProviderStackProps) {
  return (
    <Card className="h-fit rounded-none shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconSettings className="size-4" aria-hidden="true" />
          Provider stack
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
