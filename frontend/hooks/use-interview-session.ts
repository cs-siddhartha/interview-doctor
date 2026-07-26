import { useState } from "react";

import { endInterviewSession } from "@/app/actions/end-session";
import { SESSION_COPY, SESSION_STATES } from "@/constants/session";
import { type TranscriptTurn, type TurnResult } from "@/lib/schemas/session";

import { useAudioRecorder } from "./use-audio-recorder";
import { useInterviewerPlayback } from "./use-interviewer-playback";

type UseInterviewSessionOptions = {
  sessionId: string;
  initialState: string;
  initialTranscript: TranscriptTurn[];
  initialAudioBase64: string;
  initialAudioError: string | null;
};

function findLatestQuestion(transcript: TranscriptTurn[]) {
  return [...transcript]
    .reverse()
    .find((turn) => turn.speaker === "ai_interviewer")?.text;
}

// Coordinates backend session state while delegating browser media ownership
// to focused hooks with independent cleanup responsibilities.
export function useInterviewSession({
  sessionId,
  initialState,
  initialTranscript,
  initialAudioBase64,
  initialAudioError,
}: UseInterviewSessionOptions) {
  const [transcript, setTranscript] = useState(initialTranscript);
  const [turnState, setTurnState] = useState<string>(
    SESSION_COPY.metrics.state.value,
  );
  const [isEnded, setIsEnded] = useState(
    initialState === SESSION_STATES.ended,
  );
  const [isEnding, setIsEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentQuestion = findLatestQuestion(transcript);
  const initialQuestion = findLatestQuestion(initialTranscript);
  const playback = useInterviewerPlayback({
    initialAudioBase64,
    initialAudioError,
    initialQuestion,
    isEnded,
  });

  async function handleTurnResult(result: TurnResult) {
    setTranscript((currentTranscript) => [
      ...currentTranscript,
      result.candidate_turn,
      result.ai_turn,
    ]);
    setTurnState(result.state);
    await playback.playTurnResponse(
      result.audio_base64,
      result.audio_error,
      result.ai_turn.text,
    );
  }

  const recorder = useAudioRecorder({
    sessionId,
    onError: setError,
    onStateChange: setTurnState,
    onTurnResult: handleTurnResult,
  });

  async function endSession() {
    setError(null);
    setIsEnding(true);
    playback.stopPlayback();
    recorder.discardRecording();

    const result = await endInterviewSession(sessionId);

    if (!result.data) {
      setError(result.error);
      setIsEnding(false);

      return;
    }

    setTranscript(result.data.transcript);
    setTurnState(result.data.state);
    setIsEnding(false);
    setIsEnded(true);
  }

  return {
    transcript,
    currentQuestion,
    turnState,
    recorderState: recorder.recorderState,
    isBusy:
      recorder.isPending || recorder.recorderState === "processing",
    isEnding,
    isEnded,
    error,
    playbackNotice: playback.playbackNotice,
    playCurrentQuestion: () => playback.playQuestion(currentQuestion),
    toggleRecording: recorder.toggleRecording,
    endSession,
  };
}
