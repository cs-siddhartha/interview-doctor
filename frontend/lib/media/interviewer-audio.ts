import { type RefObject } from "react";

async function playAudioResponse(
  audioBase64: string,
  audioRef: RefObject<HTMLAudioElement | null>,
) {
  if (!audioBase64) {
    return false;
  }

  stopInterviewerPlayback(audioRef);

  const audio = new Audio(
    `data:application/octet-stream;base64,${audioBase64}`,
  );
  audioRef.current = audio;

  audio.onended = () => {
    if (audioRef.current === audio) {
      audioRef.current = null;
    }
  };

  try {
    await audio.play();

    return true;
  } catch {
    audio.pause();

    if (audioRef.current === audio) {
      audioRef.current = null;
    }

    return false;
  }
}

// Prevents provider audio and browser speech from overlapping while retaining
// browser speech as a fallback when provider audio cannot play.
export async function playInterviewerQuestion(
  audioBase64: string,
  question: string,
  audioRef: RefObject<HTMLAudioElement | null>,
) {
  stopInterviewerPlayback(audioRef);

  if (audioBase64 && (await playAudioResponse(audioBase64, audioRef))) {
    return "provider" as const;
  }

  if (speakWithBrowser(question)) {
    return "browser" as const;
  }

  return null;
}

// Cancels both supported playback sources so navigation and replay cannot
// leave a previous interviewer voice running.
export function stopInterviewerPlayback(
  audioRef: RefObject<HTMLAudioElement | null>,
) {
  audioRef.current?.pause();
  audioRef.current = null;
  window.speechSynthesis?.cancel();
}

function speakWithBrowser(text: string) {
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
    return false;
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));

  return true;
}

export async function playProviderAudio(
  audioBase64: string,
  audioRef: RefObject<HTMLAudioElement | null>,
) {
  return playAudioResponse(audioBase64, audioRef);
}
