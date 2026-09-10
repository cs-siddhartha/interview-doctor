import { Label } from "@/components/ui/label";
import { IconAdjustments } from "@tabler/icons-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  REALTIME_PROVIDER_VALUES,
  SESSION_TRANSPORT_OPTIONS,
} from "@/constants/providers";
import { FORM_FIELD_NAMES, SETUP_COPY } from "@/constants/setup";
import { providerFields, providerOptions } from "@/lib/interview-options";
import { type ProviderSelection } from "@/lib/provider-selection";
import { type SessionTransportValue } from "@/lib/schemas/interview";

type ProviderControlsProps = {
  providers: ProviderSelection;
  transport: SessionTransportValue;
  onTransportChange: (transport: SessionTransportValue) => void;
};

export function ProviderControls({
  providers,
  transport,
  onTransportChange,
}: ProviderControlsProps) {
  const transportDescription = SESSION_TRANSPORT_OPTIONS.find(
    (option) => option.value === transport,
  )?.description;

  return (
    <details className="group border-t border-black/10 pt-6">
      <summary className="flex cursor-pointer list-none items-center gap-3 font-semibold">
        <IconAdjustments className="size-4" aria-hidden="true" />
        {SETUP_COPY.providersTitle}
        <span className="ml-auto text-xs font-normal text-black/45">
          Advanced
        </span>
      </summary>
      <p className="mt-2 text-sm leading-6 text-black/50">
        {SETUP_COPY.providersDescription}
      </p>

      <div className="mt-5 grid gap-2 rounded-sm border border-black/10 bg-white p-5">
        <Label htmlFor="setup-transport">{SETUP_COPY.transportLabel}</Label>
        <Select
          name={FORM_FIELD_NAMES.transport}
          value={transport}
          onValueChange={(value) =>
            onTransportChange(value as SessionTransportValue)
          }
        >
          <SelectTrigger
            id="setup-transport"
            size="lg"
            className="w-full rounded-sm bg-[#f7f5ef] px-4 text-sm"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SESSION_TRANSPORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm leading-6 text-black/50">
          {transportDescription}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {providerFields.map((field) => {
          const provider = providers[field.id];
          const providerId = `setup-${field.id}`;
          const options =
            transport === "websocket"
              ? providerOptions[field.id].filter(
                  (option) =>
                    REALTIME_PROVIDER_VALUES[field.id].some(
                      (value) => value === option.value,
                    ),
                )
              : providerOptions[field.id];
          const defaultValue = options.some(
            (option) => option.value === provider.value,
          )
            ? provider.value
            : options[0].value;

          return (
            <div
              key={field.id}
              className="rounded-sm border border-black/10 bg-white p-5"
            >
              <div className="grid gap-2">
                <Label htmlFor={providerId}>{field.label}</Label>
                <Select
                  key={`${field.id}-${transport}`}
                  name={field.id}
                  defaultValue={defaultValue}
                >
                  <SelectTrigger
                    id={providerId}
                    size="lg"
                    className="w-full rounded-sm bg-[#f7f5ef] px-4 text-sm"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
      </div>
    </details>
  );
}
