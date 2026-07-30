import Link from "next/link";
import {
  IconArrowLeft,
  IconCode,
  IconStethoscope,
} from "@tabler/icons-react";

import { SessionTurnPanel } from "@/components/interview/session-turn-panel";
import { SidebarDetailsCard } from "@/components/interview/sidebar-details-card";
import { ProviderStack } from "@/components/interview/setup/provider-stack";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_COPY } from "@/constants/app";
import { ALGORITHMS_MODE } from "@/constants/interview-modes";
import { SESSION_COPY } from "@/constants/session";
import { type InterviewMode } from "@/lib/interview-options";
import { MODE_PRESENTATION } from "@/lib/mode-presentation";
import { type ProviderSelection } from "@/lib/provider-selection";
import { type TranscriptTurn } from "@/lib/schemas/session";
import { type SessionSetupItem } from "@/lib/session-setup";

type SessionPageProps = {
  mode: InterviewMode;
  providers: ProviderSelection;
  setup: SessionSetupItem[];
  backHref: string;
  sessionId: string;
  sessionState: string;
  transcript: TranscriptTurn[];
  openingAudioBase64: string;
  openingAudioError: string | null;
};

export function SessionPage({
  mode,
  providers,
  setup,
  backHref,
  sessionId,
  sessionState,
  transcript,
  openingAudioBase64,
  openingAudioError,
}: SessionPageProps) {
  const isAlgorithms = mode.mode === ALGORITHMS_MODE.id;

  return (
    <main className="min-h-screen bg-[#f3f0e8] px-5 py-5 text-[#171a1c] sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-7xl space-y-6">
        <SessionHeader mode={mode} backHref={backHref} sessionId={sessionId} />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            <div
              className={
                isAlgorithms ? "grid gap-6 2xl:grid-cols-[1fr_400px]" : ""
              }
            >
              <SessionTurnPanel
                modeId={mode.mode}
                modeTitle={mode.title}
                sessionId={sessionId}
                initialState={sessionState}
                initialTranscript={transcript}
                initialAudioBase64={openingAudioBase64}
                initialAudioError={openingAudioError}
              />
              {isAlgorithms ? <CodeWorkspace /> : null}
            </div>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
            <ProviderStack providers={providers} />
            <SetupSummary setup={setup} />
          </aside>
        </div>
      </section>
    </main>
  );
}

function SessionHeader({
  mode,
  backHref,
  sessionId,
}: {
  mode: InterviewMode;
  backHref: string;
  sessionId: string;
}) {
  const ModeIcon = mode.icon;
  const presentation = MODE_PRESENTATION[mode.mode];

  return (
    <header className="space-y-5">
      <nav className="flex items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em]">
          <span className="grid size-9 place-items-center rounded-full bg-[#171a1c] text-white">
            <IconStethoscope className="size-5" aria-hidden="true" />
          </span>
          <span className="hidden sm:inline">{APP_COPY.brand}</span>
        </Link>
        <Link
          href={backHref}
          className="flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-sm font-semibold transition-colors hover:bg-black/5"
        >
          <IconArrowLeft className="size-4" aria-hidden="true" />
          {SESSION_COPY.setupBackLabel}
        </Link>
      </nav>

      <div className={`overflow-hidden rounded-sm border border-black/10 ${presentation.softSurface}`}>
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-black/50">
            {SESSION_COPY.badge}
          </span>
          <span className="font-mono text-xs text-black/45">
            {SESSION_COPY.sessionIdLabel} {sessionId.slice(0, 8)}
          </span>
        </div>
        <div className="flex flex-col gap-5 px-6 py-7 sm:flex-row sm:items-center sm:px-8">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#171a1c] text-white">
            <ModeIcon className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              {mode.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-black/50">
              {SESSION_COPY.description}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

function CodeWorkspace() {
  return (
    <Card className="overflow-hidden rounded-sm border-black/10 bg-[#171a1c] py-0 text-white shadow-none">
      <CardHeader className="border-b border-white/10 px-6 py-5">
        <CardTitle className="flex items-center gap-2">
          <IconCode className="size-5 text-[#ffb5a5]" aria-hidden="true" />
          {SESSION_COPY.codeWorkspaceTitle}
        </CardTitle>
        <CardDescription className="text-white/45">
          {SESSION_COPY.codeWorkspaceDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        <pre className="min-h-80 overflow-auto rounded-sm border border-white/10 bg-black/20 p-5 text-sm leading-7 text-white/60">
          <code>{SESSION_COPY.codeWorkspacePlaceholder}</code>
        </pre>
      </CardContent>
    </Card>
  );
}

function SetupSummary({ setup }: { setup: SessionSetupItem[] }) {
  return (
    <SidebarDetailsCard
      title={SESSION_COPY.setupSummaryTitle}
      description={SESSION_COPY.setupSummaryDescription}
    >
      <dl className="divide-y divide-black/10">
        {setup.map((item) => (
          <div
            key={item.label}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 py-3"
          >
            <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-black/40">
              {item.label}
            </dt>
            <dd className="max-w-40 text-right text-sm font-semibold">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </SidebarDetailsCard>
  );
}
