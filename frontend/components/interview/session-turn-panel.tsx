"use client";

import {
  type RefObject,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  IconCircleFilled,
  IconMicrophone,
  IconPlayerStop,
} from "@tabler/icons-react";

import { createAudioTurn } from "@/app/actions/turns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SESSION_AUDIO, SESSION_COPY } from "@/constants/session";
import { type InterviewMode } from "@/lib/interview-options";
import { type TranscriptTurn } from "@/lib/schemas/session";

type RecorderState = "idle" | "recording" | "processing";

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
  const [recorderState, setRecorderState] = useState<RecorderState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      const stream = streamRef.current;

      stopMediaStream(stream);
    };
  }, []);


  async function handleRecordButton() {
    if (recorderState === "recording") {
      recorderRef.current?.stop();

      return;
    }

    await startRecording();
  }

  async function startRecording() {
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError(SESSION_COPY.microphoneUnavailableMessage);

      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedRecordingMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );

      chunksRef.current = [];
      streamRef.current = stream;
      recorderRef.current = recorder;
      recorder.ondataavailable = handleRecorderData;
      recorder.onstop = handleRecorderStop;
      recorder.start();
      setRecorderState("recording");
      setTurnState(SESSION_COPY.recordingStateLabel);
    } catch {
      setError(SESSION_COPY.microphonePermissionMessage);
      setRecorderState("idle");
      setTurnState(SESSION_COPY.metrics.state.value);
      stopMediaStream(streamRef.current);
      streamRef.current = null;
    }
  }

  function handleRecorderData(event: BlobEvent) {
    if (event.data.size > 0) {
      chunksRef.current.push(event.data);
    }
  }

  function handleRecorderStop() {
    const recorder = recorderRef.current;
    const audioBlob = new Blob(chunksRef.current, {
      type: recorder?.mimeType || SESSION_AUDIO.fallbackMimeType,
    });

    recorderRef.current = null;
    chunksRef.current = [];
    stopMediaStream(streamRef.current);
    streamRef.current = null;

    if (audioBlob.size === 0) {
      setError(SESSION_COPY.emptyRecordingMessage);
      setRecorderState("idle");
      setTurnState(SESSION_COPY.metrics.state.value);

      return;
    }

    setRecorderState("processing");
    setTurnState(SESSION_COPY.processingStateLabel);

    startTransition(async () => {
      try {
        const audioBase64 = await blobToBase64(audioBlob);
        const result = await createAudioTurn(sessionId, audioBase64);

        setTranscript((currentTranscript) => [
          ...currentTranscript,
          result.candidate_turn,
          result.ai_turn,
        ]);
        setTurnState(result.state);
        setRecorderState("idle");
        await playAudioResponse(result.audio_base64, audioRef);
      } catch {
        setError(SESSION_COPY.turnErrorMessage);
        setRecorderState("idle");
        setTurnState(SESSION_COPY.metrics.state.value);
      }
    });
  }

  return (
    <div className="space-y-6">
      <VoiceSessionPanel
        mode={mode}
        turnState={turnState}
        recorderState={recorderState}
        isBusy={isPending || recorderState === "processing"}
        error={error}
        onRecordButton={handleRecordButton}
      />
      <TranscriptPanel transcript={transcript} />
    </div>
  );
}

type VoiceSessionPanelProps = {
  mode: InterviewMode;
  turnState: string;
  recorderState: RecorderState;
  isBusy: boolean;
  error: string | null;
  onRecordButton: () => void;
};

function VoiceSessionPanel({
  mode,
  turnState,
  recorderState,
  isBusy,
  error,
  onRecordButton,
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
            <p className="text-lg font-medium">{audioTitle}</p>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              {audioDescription}
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
          disabled={isBusy}
          onClick={onRecordButton}
        >
          <IconMicrophone
            className="size-4"
            aria-hidden="true"
            data-icon="inline-start"
          />
          {isRecording ? SESSION_COPY.stopRecordingLabel : SESSION_COPY.startTurnLabel}
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

function getSupportedRecordingMimeType() {
  return SESSION_AUDIO.mimeTypes.find((mimeType) =>
    MediaRecorder.isTypeSupported(mimeType),
  );
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result !== "string") {
        reject(new Error(SESSION_COPY.turnErrorMessage));

        return;
      }

      resolve(reader.result.split(SESSION_AUDIO.base64Marker)[1] ?? "");
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}


function stopMediaStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

async function playAudioResponse(
  audioBase64: string,
  audioRef: RefObject<HTMLAudioElement | null>,
) {
  if (!audioBase64) {
    return;
  }

  const response = await fetch(`data:application/octet-stream;base64,${audioBase64}`);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const audio = new Audio(objectUrl);

  audioRef.current?.pause();
  audioRef.current = audio;

  audio.onended = () => URL.revokeObjectURL(objectUrl);

  try {
    await audio.play();
  } catch {
    URL.revokeObjectURL(objectUrl);
  }
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
