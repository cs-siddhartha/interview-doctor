import { LandingHeader } from "@/components/interview/landing-header";
import { LandingMetrics } from "@/components/interview/landing-metrics";
import { LandingWorkflow } from "@/components/interview/landing-workflow";
import { ModeCard } from "@/components/interview/mode-card";
import { APP_COPY } from "@/constants/app";
import { interviewModes } from "@/lib/interview-options";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f3f0e8] text-[#171a1c]">
      <LandingHeader />
      <LandingMetrics />
      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="mb-10 max-w-3xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#ca3f28]">
            {APP_COPY.modesEyebrow}
          </p>
          <h2 className="text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
            {APP_COPY.modesTitle}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-black/55">
            {APP_COPY.modesDescription}
          </p>
        </div>
        <section
          id="interview-modes"
          aria-label={APP_COPY.interviewModesAriaLabel}
          className="grid gap-4 lg:grid-cols-3"
        >
          {interviewModes.map((mode) => (
            <ModeCard key={mode.mode} mode={mode} />
          ))}
        </section>
      </div>
      <LandingWorkflow />
    </main>
  );
}
