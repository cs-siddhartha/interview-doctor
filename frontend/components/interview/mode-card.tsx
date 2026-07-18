import { IconChevronRight } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MODE_CARD_COPY,
} from "@/constants/app";
import {
  DEFAULT_PROVIDER_TRANSPORT,
  PROVIDER_TRANSPORT_LABEL,
  PROVIDER_TRANSPORT_OPTIONS,
} from "@/constants/providers";
import { FORM_FIELD_NAMES } from "@/constants/setup";
import {
  type InterviewMode,
  providerFields,
  providerOptions,
} from "@/lib/interview-options";

type ModeCardProps = {
  mode: InterviewMode;
};

export function ModeCard({ mode }: ModeCardProps) {
  return (
    <form action={mode.action}>
      <Card className="min-h-[520px] rounded-none shadow-none">
        <input type="hidden" name={FORM_FIELD_NAMES.mode} value={mode.mode} />

        <CardHeader className="gap-5">
          <CardAction>
            <Badge variant="outline" className="rounded-none uppercase">
              {mode.signal}
            </Badge>
          </CardAction>
          <div className="space-y-3">
            <CardTitle className="text-2xl font-semibold tracking-normal">
              {mode.title}
            </CardTitle>
            <CardDescription className="min-h-[78px] leading-6">
              {mode.description}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex-1">
          <div className="grid gap-3">
            {providerFields.map((field) => (
              <ProviderSelect
                key={field.id}
                id={`${mode.mode}-${field.id}`}
                name={field.id}
                label={field.label}
                options={providerOptions[field.id]}
              />
            ))}
          </div>
        </CardContent>

        <CardFooter className="border-t">
          <Button type="submit" className="h-10 w-full justify-between">
            {MODE_CARD_COPY.startSetupLabel}
            <IconChevronRight
              className="size-4"
              aria-hidden="true"
              data-icon="inline-end"
            />
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

type ProviderSelectProps = {
  id: string;
  name: string;
  label: string;
  options: { label: string; value: string; defaultTransport: string }[];
};

function ProviderSelect({ id, name, label, options }: ProviderSelectProps) {
  return (
    <div className="grid gap-1.5">
      <Label
        htmlFor={id}
        className="text-xs uppercase tracking-normal text-muted-foreground"
      >
        {label}
      </Label>
      <Select name={name} defaultValue={options[0].value}>
        <SelectTrigger id={id} className="h-10 w-full rounded-none bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((provider) => (
            <SelectItem key={provider.value} value={provider.value}>
              {provider.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Label
        htmlFor={`${id}-transport`}
        className="text-xs uppercase tracking-normal text-muted-foreground"
      >
        {PROVIDER_TRANSPORT_LABEL}
      </Label>
      <Select
        name={`${name}Transport`}
        defaultValue={DEFAULT_PROVIDER_TRANSPORT}
      >
        <SelectTrigger
          id={`${id}-transport`}
          className="h-10 w-full rounded-none bg-background"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PROVIDER_TRANSPORT_OPTIONS.map((transport) => (
            <SelectItem key={transport.value} value={transport.value}>
              {transport.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
