import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PROVIDER_TRANSPORT_LABEL,
  PROVIDER_TRANSPORT_OPTIONS,
} from "@/constants/providers";
import { SETUP_COPY } from "@/constants/setup";
import { providerFields, providerOptions } from "@/lib/interview-options";
import { type ProviderSelection } from "@/lib/provider-selection";

type ProviderControlsProps = {
  providers: ProviderSelection;
};

// Keeps provider and transport choices inside the setup form so each interview
// submits exactly the stack selected for that session.
export function ProviderControls({ providers }: ProviderControlsProps) {
  return (
    <section className="grid gap-4 border-b border-border pb-5">
      <div className="grid gap-1">
        <h2 className="text-lg font-semibold">{SETUP_COPY.providersTitle}</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          {SETUP_COPY.providersDescription}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {providerFields.map((field) => {
          const provider = providers[field.id];
          const providerId = `setup-${field.id}`;
          const transportId = `${providerId}-transport`;

          return (
            <div
              key={field.id}
              className="grid gap-3 border border-border bg-background p-4"
            >
              <div className="grid gap-2">
                <Label htmlFor={providerId}>{field.label}</Label>
                <Select
                  name={field.id}
                  defaultValue={provider.value}
                >
                  <SelectTrigger
                    id={providerId}
                    className="h-10 w-full rounded-none bg-background"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {providerOptions[field.id].map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor={transportId}>
                  {PROVIDER_TRANSPORT_LABEL}
                </Label>
                <Select
                  name={`${field.id}Transport`}
                  defaultValue={provider.transport}
                >
                  <SelectTrigger
                    id={transportId}
                    className="h-10 w-full rounded-none bg-background"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDER_TRANSPORT_OPTIONS.map((transport) => (
                      <SelectItem
                        key={transport.value}
                        value={transport.value}
                      >
                        {transport.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
