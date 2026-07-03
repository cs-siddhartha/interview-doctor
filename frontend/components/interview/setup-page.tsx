import { type InterviewMode } from "@/lib/interview-options";
import { type ProviderSelection } from "@/lib/provider-selection";
import { ProviderStack } from "./setup/provider-stack";
import { SetupForm } from "./setup/setup-form";
import { SetupHeader } from "./setup/setup-header";

type SetupPageProps = {
  mode: InterviewMode;
  providers: ProviderSelection;
};

export function SetupPage({ mode, providers }: SetupPageProps) {
  return (
    <main className="min-h-screen bg-background px-5 py-6 text-foreground sm:px-8 lg:px-10">
      <section className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <SetupHeader mode={mode} />
          <SetupForm mode={mode} providers={providers} />
        </div>

        <ProviderStack providers={providers} />
      </section>
    </main>
  );
}
