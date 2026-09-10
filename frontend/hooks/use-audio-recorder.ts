import { useCallback, useEffect, useRef, useState, useTransition } from "react";

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
  onAudioLevel: (level: number) => void;
  onStateChange: (state: string) => void;
  onTurnResult: (result: TurnResult) => Promise<void>;
};

// Contains the MediaRecorder resource lifecycle and turn submission so live
// microphone objects never leak into presentational interview components.
export function useAudioRecorder({
  sessionId,
  onError,
  onAudioLevel,
  onStateChange,
  onTurnResult,
}: UseAudioRecorderOptions) {
  const [recorderState, setRecorderState] = useState<RecorderState>("idle");
  const [isPending, startTransition] = useTransition();
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const analyserContextRef = useRef<AudioContext | null>(null);
  const analyserFrameRef = useRef<number | null>(null);
  const smoothedLevelRef = useRef(0);
  const audioLevelHandlerRef = useRef(onAudioLevel);
  const recordingRequestRef = useRef(0);
  audioLevelHandlerRef.current = onAudioLevel;

  const stopAudioLevelAnalysis = useCallback(() => {
    if (analyserFrameRef.current !== null) {
      window.cancelAnimationFrame(analyserFrameRef.current);
      analyserFrameRef.current = null;
    }

    const context = analyserContextRef.current;
    analyserContextRef.current = null;
    smoothedLevelRef.current = 0;
    audioLevelHandlerRef.current(0);

    if (context) {
      void context.close();
    }
  }, []);

  // MediaRecorder continues capturing outside React unless its tracks are
  // explicitly stopped during unmount.
  useEffect(() => {
    return () => {
      recordingRequestRef.current += 1;
      const recorder = recorderRef.current;

      if (recorder && recorder.state !== "inactive") {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        recorder.stop();
      }

      recorderRef.current = null;
      chunksRef.current = [];
      stopAudioLevelAnalysis();
      stopMediaStream(streamRef.current);
      streamRef.current = null;
    };
  }, [stopAudioLevelAnalysis]);

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
      console.error("[frontend.audio] recording unavailable", { sessionId });
      onError(SESSION_COPY.microphoneUnavailableMessage);

      return;
    }

    try {
      const recordingRequest = ++recordingRequestRef.current;
      console.info("[frontend.audio] requesting microphone", { sessionId });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (recordingRequest !== recordingRequestRef.current) {
        stopMediaStream(stream);
        return;
      }

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
      try {
        startAudioLevelAnalysis(stream);
      } catch (error) {
        console.warn("[frontend.audio] level meter unavailable", {
          sessionId,
          error,
        });
      }
      console.info("[frontend.audio] recording started", {
        sessionId,
        mimeType: recorder.mimeType,
      });
      setRecorderState("recording");
      onStateChange(SESSION_COPY.recordingStateLabel);
    } catch (error) {
      console.error("[frontend.audio] recording start failed", {
        sessionId,
        error,
      });
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
    console.info("[frontend.audio] recording stopped", {
      sessionId,
      bytes: audioBlob.size,
      mimeType: audioBlob.type,
    });

    if (audioBlob.size === 0) {
      console.warn("[frontend.audio] empty recording discarded", { sessionId });
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
          console.error("[frontend.audio] turn rejected", {
            sessionId,
            error: turnResult.error,
          });
          onError(turnResult.error);
          setRecorderState("idle");
          onStateChange(SESSION_COPY.metrics.state.value);

          return;
        }

        setRecorderState("idle");
        console.info("[frontend.audio] turn completed", {
          sessionId,
          state: turnResult.data.state,
        });
        await onTurnResult(turnResult.data);
      } catch (error) {
        console.error("[frontend.audio] turn processing failed", {
          sessionId,
          error,
        });
        onError(SESSION_COPY.turnErrorMessage);
        setRecorderState("idle");
        onStateChange(SESSION_COPY.metrics.state.value);
      }
    });
  }

  function clearRecorderResources() {
    recorderRef.current = null;
    chunksRef.current = [];
    stopAudioLevelAnalysis();
    stopMediaStream(streamRef.current);
    streamRef.current = null;
  }

  // Samples microphone energy directly into the visual meter without causing React renders.
  function startAudioLevelAnalysis(stream: MediaStream) {
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    const source = context.createMediaStreamSource(stream);

    analyser.fftSize = 256;
    const samples = new Uint8Array(analyser.fftSize);
    source.connect(analyser);
    analyserContextRef.current = context;

    const sampleLevel = () => {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;

      for (const sample of samples) {
        const normalized = (sample - 128) / 128;
        sum += normalized * normalized;
      }

      const rms = Math.sqrt(sum / samples.length);
      const targetLevel = Math.min(1, Math.max(0, (rms - 0.003) * 14));
      smoothedLevelRef.current =
        smoothedLevelRef.current * 0.65 + targetLevel * 0.35;
      audioLevelHandlerRef.current(smoothedLevelRef.current);
      analyserFrameRef.current = window.requestAnimationFrame(sampleLevel);
    };

    sampleLevel();
  }

  function discardRecordingResources() {
    recordingRequestRef.current += 1;
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
