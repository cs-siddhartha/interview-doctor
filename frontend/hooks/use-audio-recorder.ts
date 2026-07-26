import { useEffect, useRef, useState, useTransition } from "react";

import { createAudioTurn } from "@/app/actions/turns";
import { type RecorderState } from "@/components/interview/session/session-types";
import { SESSION_AUDIO, SESSION_COPY } from "@/constants/session";
import {
  blobToBase64,
  getSupportedRecordingMimeType,
  stopMediaStream,
} from "@/lib/media/recording";
import { type TurnResult } from "@/lib/schemas/session";

type UseAudioRecorderOptions = {
  sessionId: string;
  onError: (error: string | null) => void;
  onStateChange: (state: string) => void;
  onTurnResult: (result: TurnResult) => Promise<void>;
};

// Contains the MediaRecorder resource lifecycle and turn submission so live
// microphone objects never leak into presentational interview components.
export function useAudioRecorder({
  sessionId,
  onError,
  onStateChange,
  onTurnResult,
}: UseAudioRecorderOptions) {
  const [recorderState, setRecorderState] = useState<RecorderState>("idle");
  const [isPending, startTransition] = useTransition();
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // MediaRecorder continues capturing outside React unless its tracks are
  // explicitly stopped during unmount.
  useEffect(() => {
    return () => {
      const recorder = recorderRef.current;

      if (recorder && recorder.state !== "inactive") {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        recorder.stop();
      }

      recorderRef.current = null;
      chunksRef.current = [];
      stopMediaStream(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  async function toggleRecording() {
    if (recorderState === "recording") {
      recorderRef.current?.stop();

      return;
    }

    await startRecording();
  }

  async function startRecording() {
    onError(null);

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      onError(SESSION_COPY.microphoneUnavailableMessage);

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
      onStateChange(SESSION_COPY.recordingStateLabel);
    } catch {
      onError(SESSION_COPY.microphonePermissionMessage);
      setRecorderState("idle");
      onStateChange(SESSION_COPY.metrics.state.value);
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

    clearRecorderResources();

    if (audioBlob.size === 0) {
      onError(SESSION_COPY.emptyRecordingMessage);
      setRecorderState("idle");
      onStateChange(SESSION_COPY.metrics.state.value);

      return;
    }

    setRecorderState("processing");
    onStateChange(SESSION_COPY.processingStateLabel);

    startTransition(async () => {
      try {
        const audioBase64 = await blobToBase64(audioBlob);
        const turnResult = await createAudioTurn(
          sessionId,
          audioBase64,
          audioBlob.type || SESSION_AUDIO.fallbackMimeType,
        );

        if (!turnResult.data) {
          onError(turnResult.error);
          setRecorderState("idle");
          onStateChange(SESSION_COPY.metrics.state.value);

          return;
        }

        setRecorderState("idle");
        await onTurnResult(turnResult.data);
      } catch {
        onError(SESSION_COPY.turnErrorMessage);
        setRecorderState("idle");
        onStateChange(SESSION_COPY.metrics.state.value);
      }
    });
  }

  function clearRecorderResources() {
    recorderRef.current = null;
    chunksRef.current = [];
    stopMediaStream(streamRef.current);
    streamRef.current = null;
  }

  function discardRecordingResources() {
    const recorder = recorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.stop();
    }

    clearRecorderResources();
    setRecorderState("idle");
  }

  return {
    recorderState,
    isPending,
    toggleRecording,
    discardRecording: discardRecordingResources,
  };
}
