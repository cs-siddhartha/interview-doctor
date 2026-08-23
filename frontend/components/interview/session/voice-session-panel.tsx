import { type CSSProperties, type RefObject } from "react";
import { IconMicrophone, IconPlayerStop, IconVolume } from "@tabler/icons-react";

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
import { type InterviewModeId } from "@/lib/interview-options";
import { MODE_PRESENTATION } from "@/lib/mode-presentation";

import { AUDIO_PRESENTATION } from "./session-presentation";
import { type RecorderState } from "./session-types";
import { StatusMetric } from "./status-metric";

const VOICE_METER_BARS = [0.56, 0.82, 1, 0.76, 0.48] as const;

type VoiceSessionPanelProps = {
  modeId: InterviewModeId;
  modeTitle: string;
  question: string;
  turnState: string;
  recorderState: RecorderState;
  hasStarted: boolean;
  isBusy: boolean;
  isAnswerActive?: boolean;
  isEnding: boolean;
  error: string | null;
  playbackNotice: string | null;
  audioLevelRef: RefObject<HTMLDivElement | null>;
  canPlayQuestion: boolean;
  onPlayQuestion: () => void;
  onRecordButton?: () => void;
  onFinishAnswer?: () => void;
  showRecordingControl?: boolean;
  onEndSession: () => void;
};

export function VoiceSessionPanel({
  modeId,
  modeTitle,
  question,
  turnState,
  recorderState,
  hasStarted,
  isBusy,
  isAnswerActive = false,
  isEnding,
  error,
  playbackNotice,
  audioLevelRef,
  canPlayQuestion,
  onPlayQuestion,
  onRecordButton,
  onFinishAnswer,
  showRecordingControl = true,
  onEndSession,
}: VoiceSessionPanelProps) {
  const isRecording = recorderState === "recording";
  const modeSurface = MODE_PRESENTATION[modeId].surface;
  const audioState = hasStarted ? recorderState : "ready";
  const audioPresentation = AUDIO_PRESENTATION[audioState];

  return (
    <Card className="overflow-hidden rounded-sm border-black/10 bg-[#171a1c] py-0 text-white shadow-2xl shadow-black/10">
      <CardHeader className="border-b border-white/10 px-6 py-5 sm:px-8">
        <CardTitle className="text-xl">{SESSION_COPY.liveInterviewTitle}</CardTitle>
        <CardDescription className="text-white/45">
          {SESSION_COPY.liveInterviewDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 px-6 py-6 sm:px-8">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <StatusMetric
            label={SESSION_COPY.metrics.state.label}
            value={turnState}
            tone="dark"
          />
          <StatusMetric
            label={SESSION_COPY.metrics.mode.label}
            value={modeTitle}
            tone="dark"
          />
          <StatusMetric
            label={SESSION_COPY.metrics.elapsed.label}
            value={SESSION_COPY.metrics.elapsed.value}
            tone="dark"
          />
        </div>

        <div className="flex min-h-80 flex-col items-center justify-center gap-7 rounded-sm border border-white/10 bg-white/[0.035] p-6 text-center sm:p-10">
          <div
            ref={audioLevelRef}
            className="flex flex-col items-center gap-4"
            style={{ "--voice-level": 0 } as CSSProperties}
          >
            <div className="relative grid size-20 place-items-center">
              <div
                className={`absolute inset-0 rounded-full transition-[transform,opacity] duration-75 ${modeSurface}`}
                style={{
                  opacity: "calc(var(--voice-level) * 0.38)",
                  transform:
                    "scale(calc(1 + (var(--voice-level) * 0.42)))",
                }}
                aria-hidden="true"
              />
              <div className={`relative grid size-20 place-items-center rounded-full text-[#171a1c] ${modeSurface}`}>
                <IconMicrophone className="size-8" aria-hidden="true" />
              </div>
            </div>
            <div
              className={`flex h-8 items-center gap-1.5 transition-opacity ${
                isRecording ? "opacity-100" : "opacity-0"
              }`}
              role="img"
              aria-label={SESSION_COPY.microphoneLevelLabel}
              aria-hidden={!isRecording}
            >
              {VOICE_METER_BARS.map((amplitude, index) => (
                <span
                  key={index}
                  className={`h-7 w-1.5 origin-center rounded-full ${modeSurface}`}
                  style={{
                    transform: `scaleY(calc(0.16 + (var(--voice-level) * ${amplitude})))`,
                  }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
              {audioPresentation.title}
            </p>
            <p className="mx-auto max-w-3xl text-2xl font-medium leading-9 tracking-[-0.02em] sm:text-3xl sm:leading-10">
              {question}
            </p>
            <p className="mx-auto max-w-lg text-sm leading-6 text-white/45">
              {!hasStarted || showRecordingControl
                ? audioPresentation.description
                : SESSION_COPY.realtimeListeningDescription}
            </p>
            {playbackNotice ? (
              <p className="text-sm font-medium text-[#d7ff66]">
                {playbackNotice}
              </p>
            ) : null}
            {error ? (
              <p className="text-sm font-medium text-[#ff8f79]">{error}</p>
            ) : null}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 border-t border-white/10 px-6 py-5 sm:flex-row sm:px-8">
        <Button
          type="button"
          variant="outline"
          className={`h-11 w-full rounded-full sm:w-auto ${
            hasStarted
              ? "border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
              : `border-transparent text-[#171a1c] hover:opacity-90 ${modeSurface}`
          }`}
          disabled={!canPlayQuestion || isBusy}
          onClick={onPlayQuestion}
        >
          <IconVolume className="size-4" aria-hidden="true" />
          {hasStarted
            ? SESSION_COPY.playQuestionLabel
            : SESSION_COPY.startInterviewLabel}
        </Button>
        {showRecordingControl ? (
          <Button
            type="button"
            className={`h-11 w-full rounded-full px-6 text-[#171a1c] hover:opacity-90 sm:w-auto ${modeSurface}`}
            disabled={isBusy || !hasStarted}
            onClick={onRecordButton}
          >
            <IconMicrophone className="size-4" aria-hidden="true" />
            {isRecording
              ? SESSION_COPY.stopRecordingLabel
              : SESSION_COPY.startTurnLabel}
          </Button>
        ) : null}
        {!showRecordingControl && isAnswerActive && onFinishAnswer ? (
          <Button
            type="button"
            className={`h-11 w-full rounded-full px-6 text-[#171a1c] hover:opacity-90 sm:w-auto ${modeSurface}`}
            disabled={recorderState === "processing"}
            onClick={onFinishAnswer}
          >
            <IconPlayerStop className="size-4" aria-hidden="true" />
            {SESSION_COPY.finishAnswerLabel}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          className="h-11 w-full rounded-full text-white/55 hover:bg-white/10 hover:text-white sm:ml-auto sm:w-auto"
          disabled={isBusy || isEnding}
          onClick={onEndSession}
        >
          <IconPlayerStop className="size-4" aria-hidden="true" />
          {isEnding
            ? SESSION_COPY.endingSessionLabel
            : SESSION_COPY.endSessionLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
