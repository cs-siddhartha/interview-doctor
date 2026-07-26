import { IconMicrophone, IconPlayerStop } from "@tabler/icons-react";

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

import { type RecorderState } from "./session-types";
import { StatusMetric } from "./status-metric";

type VoiceSessionPanelProps = {
  modeSignal: string;
  question: string;
  turnState: string;
  recorderState: RecorderState;
  isBusy: boolean;
  isEnding: boolean;
  error: string | null;
  playbackNotice: string | null;
  canPlayQuestion: boolean;
  onPlayQuestion: () => void;
  onRecordButton: () => void;
  onEndSession: () => void;
};

export function VoiceSessionPanel({
  modeSignal,
  question,
  turnState,
  recorderState,
  isBusy,
  isEnding,
  error,
  playbackNotice,
  canPlayQuestion,
  onPlayQuestion,
  onRecordButton,
  onEndSession,
}: VoiceSessionPanelProps) {
  const isRecording = recorderState === "recording";
  const audioTitle =
    recorderState === "recording"
      ? SESSION_COPY.recordingAudioTitle
      : recorderState === "processing"
        ? SESSION_COPY.processingAudioTitle
        : SESSION_COPY.audioTitle;
  const audioDescription =
    recorderState === "recording"
      ? SESSION_COPY.recordingAudioDescription
      : recorderState === "processing"
        ? SESSION_COPY.processingAudioDescription
        : SESSION_COPY.audioDescription;

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
          <StatusMetric
            label={SESSION_COPY.metrics.mode.label}
            value={modeSignal}
          />
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
            <p className="text-sm font-medium uppercase text-muted-foreground">
              {audioTitle}
            </p>
            <p className="max-w-2xl text-lg font-medium">{question}</p>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              {audioDescription}
            </p>
            {playbackNotice ? (
              <p className="text-sm font-medium text-muted-foreground">
                {playbackNotice}
              </p>
            ) : null}
            {error ? (
              <p className="text-sm font-medium text-destructive">{error}</p>
            ) : null}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 border-t sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full sm:w-auto"
          disabled={!canPlayQuestion || isBusy}
          onClick={onPlayQuestion}
        >
          {SESSION_COPY.playQuestionLabel}
        </Button>
        <Button
          type="button"
          className="h-10 w-full sm:w-auto"
          disabled={isBusy}
          onClick={onRecordButton}
        >
          <IconMicrophone
            className="size-4"
            aria-hidden="true"
            data-icon="inline-start"
          />
          {isRecording
            ? SESSION_COPY.stopRecordingLabel
            : SESSION_COPY.startTurnLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full sm:w-auto"
          disabled={isBusy || isEnding}
          onClick={onEndSession}
        >
          <IconPlayerStop
            className="size-4"
            aria-hidden="true"
            data-icon="inline-start"
          />
          {isEnding
            ? SESSION_COPY.endingSessionLabel
            : SESSION_COPY.endSessionLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
