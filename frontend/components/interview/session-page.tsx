import Link from "next/link";
import {
  IconArrowLeft,
  IconCircleFilled,
  IconCode,
  IconMicrophone,
  IconPlayerStop,
} from "@tabler/icons-react";

import { ProviderStack } from "@/components/interview/setup/provider-stack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type InterviewMode } from "@/lib/interview-options";
import { type ProviderSelection } from "@/lib/provider-selection";
import { type SessionSetupItem } from "@/lib/session-setup";

type SessionPageProps = {
  mode: InterviewMode;
  providers: ProviderSelection;
  setup: SessionSetupItem[];
  backHref: string;
  sessionId?: string;
};

const transcriptTurns = [
  {
    speaker: "AI interviewer",
    text: "Welcome. I will start with a focused question and adapt based on your answer.",
  },
  {
    speaker: "Candidate",
    text: "This is where the live transcript from streamed speech will appear.",
  },
  {
    speaker: "AI interviewer",
    text: "Mock follow-up: explain the tradeoff behind your previous answer.",
  },
];

export function SessionPage({
  mode,
  providers,
  setup,
  backHref,
  sessionId,
}: SessionPageProps) {
  const isDsa = mode.mode === "dsa";

  return (
    <main className="min-h-screen bg-background px-5 py-6 text-foreground sm:px-8 lg:px-10">
      <section className="mx-auto grid w-full max-w-7xl gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <SessionHeader mode={mode} backHref={backHref} sessionId={sessionId} />
          <div className={isDsa ? "grid gap-6 lg:grid-cols-[1fr_420px]" : ""}>
            <VoiceSessionPanel mode={mode} />
            {isDsa ? <CodeWorkspace /> : null}
          </div>
          <TranscriptPanel />
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
  sessionId?: string;
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
          Setup
        </Link>
      </Button>

      <div className="max-w-3xl space-y-3">
        <Badge variant="outline" className="rounded-none uppercase">
          Mock session
        </Badge>
        <h1 className="text-4xl font-semibold tracking-normal">
          {mode.title}
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          This mock session shell now starts from a backend-created session and
          keeps layout, state, transcript, and mode-specific workspace visible.
        </p>
        {sessionId ? (
          <p className="text-sm font-medium text-muted-foreground">
            Session ID: <span className="text-foreground">{sessionId}</span>
          </p>
        ) : null}
      </div>
    </header>
  );
}

function VoiceSessionPanel({ mode }: { mode: InterviewMode }) {
  return (
    <Card className="rounded-none shadow-none">
      <CardHeader>
        <CardTitle>Live interview</CardTitle>
        <CardDescription>
          Turn-taking and audio streaming will connect here later.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatusMetric label="State" value="Listening" />
          <StatusMetric label="Mode" value={mode.signal} />
          <StatusMetric label="Elapsed" value="00:00" />
        </div>

        <div className="flex min-h-56 flex-col items-center justify-center gap-5 border border-border bg-background p-6 text-center">
          <div className="grid size-20 place-items-center rounded-full bg-primary text-primary-foreground">
            <IconMicrophone className="size-8" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">Ready for mock audio</p>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              The real session will stream microphone audio to the backend and
              play synthesized interviewer responses.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 border-t sm:flex-row">
        <Button type="button" className="h-10 w-full sm:w-auto">
          <IconMicrophone
            className="size-4"
            aria-hidden="true"
            data-icon="inline-start"
          />
          Start mock turn
        </Button>
        <Button type="button" variant="outline" className="h-10 w-full sm:w-auto">
          <IconPlayerStop
            className="size-4"
            aria-hidden="true"
            data-icon="inline-start"
          />
          End session
        </Button>
      </CardFooter>
    </Card>
  );
}

function StatusMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border border-border bg-background p-3">
      <span className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </span>
      <span className="flex items-center gap-2 text-sm font-medium">
        {label === "State" ? (
          <IconCircleFilled className="size-2 text-primary" aria-hidden="true" />
        ) : null}
        {value}
      </span>
    </div>
  );
}

function TranscriptPanel() {
  return (
    <Card className="rounded-none shadow-none">
      <CardHeader>
        <CardTitle>Transcript</CardTitle>
        <CardDescription>
          Mock turns show the structure that streaming events will fill.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {transcriptTurns.map((turn) => (
          <div key={turn.speaker} className="border border-border bg-background p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-normal text-muted-foreground">
              {turn.speaker}
            </p>
            <p className="text-sm leading-6">{turn.text}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function CodeWorkspace() {
  return (
    <Card className="rounded-none shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconCode className="size-4" aria-hidden="true" />
          Code workspace
        </CardTitle>
        <CardDescription>
          Monaco and problem execution will be added after the backend skeleton.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="min-h-80 overflow-auto border border-border bg-background p-4 text-sm leading-6 text-muted-foreground">
          <code>{`function solve(input) {
  // Mock editor placeholder
  return input
}`}</code>
        </pre>
      </CardContent>
    </Card>
  );
}

function SetupSummary({ setup }: { setup: SessionSetupItem[] }) {
  return (
    <Card className="rounded-none shadow-none">
      <CardHeader>
        <CardTitle>Setup</CardTitle>
        <CardDescription>Inputs carried from the setup page.</CardDescription>
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
