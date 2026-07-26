import { useEffect, useRef, useState } from "react";

import { SESSION_COPY } from "@/constants/session";
import {
  playInterviewerQuestion,
  stopInterviewerPlayback,
} from "@/lib/media/interviewer-audio";

type UseInterviewerPlaybackOptions = {
  initialAudioBase64: string;
  initialAudioError: string | null;
};

export function useInterviewerPlayback({
  initialAudioBase64,
  initialAudioError,
}: UseInterviewerPlaybackOptions) {
  const [audioBase64, setAudioBase64] = useState(initialAudioBase64);
  const [audioError, setAudioError] = useState(initialAudioError);
  const [hasStarted, setHasStarted] = useState(false);
  const [playbackNotice, setPlaybackNotice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // The audio element and browser speech can outlive this component unless
  // both playback paths are explicitly released during unmount.
  useEffect(() => {
    return () => {
      stopInterviewerPlayback(audioRef);
    };
  }, []);

  async function playQuestion(question: string | undefined) {
    setPlaybackNotice(null);
    setHasStarted(true);

    if (!question) {
      setPlaybackNotice(SESSION_COPY.audioPlaybackErrorMessage);

      return;
    }

    const playbackSource = await playInterviewerQuestion(
      audioBase64,
      question,
      audioRef,
    );

    if (!playbackSource) {
      setPlaybackNotice(SESSION_COPY.audioPlaybackErrorMessage);
    } else if (playbackSource === "browser") {
      setPlaybackNotice(SESSION_COPY.browserVoiceFallbackMessage);
    } else if (audioError) {
      setPlaybackNotice(SESSION_COPY.serverVoiceFallbackMessage);
    }
  }

  async function playTurnResponse(
    nextAudioBase64: string,
    nextAudioError: string | null,
    question: string,
  ) {
    setAudioBase64(nextAudioBase64);
    setAudioError(nextAudioError);

    const playbackSource = await playInterviewerQuestion(
      nextAudioBase64,
      question,
      audioRef,
    );

    setPlaybackNotice(
      playbackSource === "browser"
        ? SESSION_COPY.browserVoiceFallbackMessage
        : playbackSource === "provider" && nextAudioError
          ? SESSION_COPY.serverVoiceFallbackMessage
          : playbackSource
            ? null
            : SESSION_COPY.followUpReadyMessage,
    );
  }

  function stopPlayback() {
    stopInterviewerPlayback(audioRef);
  }

  return {
    hasStarted,
    playbackNotice,
    playQuestion,
    playTurnResponse,
    stopPlayback,
  };
}
