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

export function ProviderControls({ providers }: ProviderControlsProps) {
  return (
    <section className="grid gap-5 border-b border-black/10 pb-8">
      <div className="grid gap-2 sm:grid-cols-[3rem_1fr]">
        <span className="font-mono text-xs font-semibold text-black/40">01</span>
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">
            {SETUP_COPY.providersTitle}
          </h2>
          <p className="mt-1 text-sm leading-6 text-black/50">
          {SETUP_COPY.providersDescription}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {providerFields.map((field) => {
          const provider = providers[field.id];
          const providerId = `setup-${field.id}`;
          const transportId = `${providerId}-transport`;

          return (
            <div
              key={field.id}
              className="grid gap-4 rounded-sm border border-black/10 bg-white p-5"
            >
              <div className="grid gap-2">
                <Label htmlFor={providerId}>{field.label}</Label>
                <Select
                  name={field.id}
                  defaultValue={provider.value}
                >
                  <SelectTrigger id={providerId} className="h-11 w-full rounded-sm bg-[#f7f5ef]">
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
                  <SelectTrigger id={transportId} className="h-11 w-full rounded-sm bg-[#f7f5ef]">
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
