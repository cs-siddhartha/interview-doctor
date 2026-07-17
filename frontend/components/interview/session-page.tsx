import Link from "next/link";
import {
  IconArrowLeft,
  IconCode,
} from "@tabler/icons-react";

import { SessionTurnPanel } from "@/components/interview/session-turn-panel";
import { ProviderStack } from "@/components/interview/setup/provider-stack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DSA_MODE } from "@/constants/interview-modes";
import { SESSION_COPY } from "@/constants/session";
import { type InterviewMode } from "@/lib/interview-options";
import { type ProviderSelection } from "@/lib/provider-selection";
import { type TranscriptTurn } from "@/lib/schemas/session";
import { type SessionSetupItem } from "@/lib/session-setup";

type SessionPageProps = {
  mode: InterviewMode;
  providers: ProviderSelection;
  setup: SessionSetupItem[];
  backHref: string;
  sessionId: string;
  transcript: TranscriptTurn[];
};

export function SessionPage({
  mode,
  providers,
  setup,
  backHref,
  sessionId,
  transcript,
}: SessionPageProps) {
  const isDsa = mode.mode === DSA_MODE.id;

  return (
    <main className="min-h-screen bg-background px-5 py-6 text-foreground sm:px-8 lg:px-10">
      <section className="mx-auto grid w-full max-w-7xl gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <SessionHeader mode={mode} backHref={backHref} sessionId={sessionId} />
          <div className={isDsa ? "grid gap-6 lg:grid-cols-[1fr_420px]" : ""}>
            <SessionTurnPanel
              mode={mode}
              sessionId={sessionId}
              initialTranscript={transcript}
            />
            {isDsa ? <CodeWorkspace /> : null}
          </div>
        </div>

        <div className="space-y-6">
          <ProviderStack providers={providers} />
          <SetupSummary setup={setup} />
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
  return (
    <header className="space-y-5 border-b border-border pb-6">
      <Button asChild variant="outline">
        <Link href={backHref} className="w-fit">
          <IconArrowLeft
            className="size-4"
            aria-hidden="true"
            data-icon="inline-start"
          />
          {SESSION_COPY.setupBackLabel}
        </Link>
      </Button>

      <div className="max-w-3xl space-y-3">
        <Badge variant="outline" className="rounded-none uppercase">
          {SESSION_COPY.badge}
        </Badge>
        <h1 className="text-4xl font-semibold tracking-normal">
          {mode.title}
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          {SESSION_COPY.description}
        </p>
        <p className="text-sm font-medium text-muted-foreground">
          {SESSION_COPY.sessionIdLabel}{" "}
          <span className="text-foreground">{sessionId}</span>
        </p>
      </div>
    </header>
  );
}

function CodeWorkspace() {
  return (
    <Card className="rounded-none shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconCode className="size-4" aria-hidden="true" />
          {SESSION_COPY.codeWorkspaceTitle}
        </CardTitle>
        <CardDescription>
          {SESSION_COPY.codeWorkspaceDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="min-h-80 overflow-auto border border-border bg-background p-4 text-sm leading-6 text-muted-foreground">
          <code>{SESSION_COPY.codeWorkspacePlaceholder}</code>
        </pre>
      </CardContent>
    </Card>
  );
}

function SetupSummary({ setup }: { setup: SessionSetupItem[] }) {
  return (
    <Card className="rounded-none shadow-none">
      <CardHeader>
        <CardTitle>{SESSION_COPY.setupSummaryTitle}</CardTitle>
        <CardDescription>{SESSION_COPY.setupSummaryDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3">
          {setup.map((item) => (
            <div
              key={item.label}
              className="grid gap-1 border border-border bg-background p-3"
            >
              <dt className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                {item.label}
              </dt>
              <dd className="text-sm font-medium">{item.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
