import { type InterviewMode } from "@/lib/interview-options";
import { type ProviderSelection } from "@/lib/provider-selection";
import { SetupForm } from "./setup/setup-form";
import { SetupHeader } from "./setup/setup-header";

type SetupPageProps = {
  mode: InterviewMode;
  providers: ProviderSelection;
};

export function SetupPage({ mode, providers }: SetupPageProps) {
  return (
    <main className="min-h-screen bg-[#f3f0e8] px-5 py-5 text-[#171a1c] sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-7xl space-y-6">
        <SetupHeader mode={mode} />
        <SetupForm modeId={mode.mode} providers={providers} />
      </section>
    </main>
  );
}
