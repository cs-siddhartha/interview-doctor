import { LandingHeader } from "@/components/interview/landing-header";
import { ModeCard } from "@/components/interview/mode-card";
import { APP_COPY } from "@/constants/app";
import { interviewModes } from "@/lib/interview-options";

export default function Home() {
  return (
    <main className="min-h-screen bg-background px-5 py-6 text-foreground sm:px-8 lg:px-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <LandingHeader />

        <section
          aria-label={APP_COPY.interviewModesAriaLabel}
          className="grid gap-4 md:grid-cols-3"
        >
          {interviewModes.map((mode) => (
            <ModeCard key={mode.mode} mode={mode} />
          ))}
        </section>
      </section>
    </main>
  );
}
