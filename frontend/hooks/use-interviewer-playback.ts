import { useEffect, useRef, useState } from "react";

import { SESSION_COPY } from "@/constants/session";
import {
  playInterviewerQuestion,
  playProviderAudio,
  stopInterviewerPlayback,
} from "@/lib/media/interviewer-audio";

type UseInterviewerPlaybackOptions = {
  initialAudioBase64: string;
  initialAudioError: string | null;
  initialQuestion: string | undefined;
  isEnded: boolean;
};

// Owns the external audio lifecycle so the session controller does not manage
// provider playback and browser speech as separate competing resources.
export function useInterviewerPlayback({
  initialAudioBase64,
  initialAudioError,
  initialQuestion,
  isEnded,
}: UseInterviewerPlaybackOptions) {
  const [audioBase64, setAudioBase64] = useState(initialAudioBase64);
  const [audioError, setAudioError] = useState(initialAudioError);
  const [playbackNotice, setPlaybackNotice] = useState<string | null>(
    initialAudioBase64 ? null : SESSION_COPY.audioPlaybackErrorMessage,
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Autoplay is a mount-side browser interaction; cleanup prevents that audio
  // from surviving completion, navigation, or component replacement.
  useEffect(() => {
    let isCancelled = false;

    if (isEnded || !initialQuestion || !initialAudioBase64) {
      return;
    }

    void playProviderAudio(initialAudioBase64, audioRef).then((didPlay) => {
      if (isCancelled) {
        return;
      }

      if (didPlay && initialAudioError) {
        setPlaybackNotice(SESSION_COPY.serverVoiceFallbackMessage);
      } else if (!didPlay) {
        setPlaybackNotice(SESSION_COPY.autoplayBlockedMessage);
      }
    });

    return () => {
      isCancelled = true;
      stopInterviewerPlayback(audioRef);
    };
  }, [initialAudioBase64, initialAudioError, initialQuestion, isEnded]);

  async function playQuestion(question: string | undefined) {
    setPlaybackNotice(null);

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
            : SESSION_COPY.audioPlaybackErrorMessage,
    );
  }

  function stopPlayback() {
    stopInterviewerPlayback(audioRef);
  }

  return {
    playbackNotice,
    playQuestion,
    playTurnResponse,
    stopPlayback,
  };
}
