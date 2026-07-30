import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

          return (
            <div
              key={field.id}
              className="rounded-sm border border-black/10 bg-white p-5"
            >
              <div className="grid gap-2">
                <Label htmlFor={providerId}>{field.label}</Label>
                <Select
                  name={field.id}
                  defaultValue={provider.value}
                >
                  <SelectTrigger
                    id={providerId}
                    size="lg"
                    className="w-full rounded-sm bg-[#f7f5ef] px-4 text-sm"
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
            </div>
          );
        })}
      </div>
    </section>
  );
}
