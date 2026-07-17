"use client";

import { useState, useTransition } from "react";
import {
  IconCircleFilled,
  IconMicrophone,
  IconPlayerStop,
} from "@tabler/icons-react";

import { createMockTurn } from "@/app/actions/turns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SESSION_COPY } from "@/constants/session";
import { type InterviewMode } from "@/lib/interview-options";
import { type TranscriptTurn } from "@/lib/schemas/session";

type SessionTurnPanelProps = {
  mode: InterviewMode;
  sessionId: string;
  initialTranscript: TranscriptTurn[];
};

export function SessionTurnPanel({
  mode,
  sessionId,
  initialTranscript,
}: SessionTurnPanelProps) {
  const [transcript, setTranscript] = useState(initialTranscript);
  const [turnState, setTurnState] = useState<string>(
    SESSION_COPY.metrics.state.value,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Starts one mock HTTP turn and appends the backend-produced candidate and AI
  // transcript entries to the visible session transcript.
  function handleStartTurn() {
    setError(null);
    setTurnState(SESSION_COPY.turnInProgressLabel);

    startTransition(async () => {
      try {
        const result = await createMockTurn(sessionId);

        setTranscript((currentTranscript) => [
          ...currentTranscript,
          result.candidate_turn,
          result.ai_turn,
        ]);
        setTurnState(result.state);
      } catch {
        setError(SESSION_COPY.turnErrorMessage);
        setTurnState(SESSION_COPY.metrics.state.value);
      }
    });
  }

  return (
    <div className="space-y-6">
      <VoiceSessionPanel
        mode={mode}
        turnState={turnState}
        isPending={isPending}
        error={error}
        onStartTurn={handleStartTurn}
      />
      <TranscriptPanel transcript={transcript} />
    </div>
  );
}

type VoiceSessionPanelProps = {
  mode: InterviewMode;
  turnState: string;
  isPending: boolean;
  error: string | null;
  onStartTurn: () => void;
};

function VoiceSessionPanel({
  mode,
  turnState,
  isPending,
  error,
  onStartTurn,
}: VoiceSessionPanelProps) {
  return (
    <Card className="rounded-none shadow-none">
      <CardHeader>
        <CardTitle>{SESSION_COPY.liveInterviewTitle}</CardTitle>
        <CardDescription>
          {SESSION_COPY.liveInterviewDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatusMetric
            label={SESSION_COPY.metrics.state.label}
            value={turnState}
          />
          <StatusMetric label={SESSION_COPY.metrics.mode.label} value={mode.signal} />
          <StatusMetric
            label={SESSION_COPY.metrics.elapsed.label}
            value={SESSION_COPY.metrics.elapsed.value}
          />
        </div>

        <div className="flex min-h-56 flex-col items-center justify-center gap-5 border border-border bg-background p-6 text-center">
          <div className="grid size-20 place-items-center rounded-full bg-primary text-primary-foreground">
            <IconMicrophone className="size-8" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">{SESSION_COPY.audioTitle}</p>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              {SESSION_COPY.audioDescription}
            </p>
            {error ? (
              <p className="text-sm font-medium text-destructive">{error}</p>
            ) : null}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 border-t sm:flex-row">
        <Button
          type="button"
          className="h-10 w-full sm:w-auto"
          disabled={isPending}
          onClick={onStartTurn}
        >
          <IconMicrophone
            className="size-4"
            aria-hidden="true"
            data-icon="inline-start"
          />
          {isPending ? SESSION_COPY.turnInProgressLabel : SESSION_COPY.startTurnLabel}
        </Button>
        <Button type="button" variant="outline" className="h-10 w-full sm:w-auto">
          <IconPlayerStop
            className="size-4"
            aria-hidden="true"
            data-icon="inline-start"
          />
          {SESSION_COPY.endSessionLabel}
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
        {label === SESSION_COPY.metrics.state.label ? (
          <IconCircleFilled className="size-2 text-primary" aria-hidden="true" />
        ) : null}
        {value}
      </span>
    </div>
  );
}

function TranscriptPanel({ transcript }: { transcript: TranscriptTurn[] }) {
  return (
    <Card className="rounded-none shadow-none">
      <CardHeader>
        <CardTitle>{SESSION_COPY.transcriptTitle}</CardTitle>
        <CardDescription>
          {SESSION_COPY.transcriptDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {transcript.length > 0 ? (
          transcript.map((turn) => (
            <div
              key={`${turn.speaker}-${turn.created_at}`}
              className="border border-border bg-background p-4"
            >
              <p className="mb-2 text-xs font-medium uppercase tracking-normal text-muted-foreground">
                {turn.speaker}
              </p>
              <p className="text-sm leading-6">{turn.text}</p>
            </div>
          ))
        ) : (
          <div className="border border-border bg-background p-4">
            <p className="mb-2 text-sm font-medium">
              {SESSION_COPY.transcriptEmptyTitle}
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              {SESSION_COPY.transcriptEmptyDescription}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
