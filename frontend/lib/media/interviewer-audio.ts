import { type RefObject } from "react";

async function playAudioResponse(
  audioBase64: string,
  audioRef: RefObject<HTMLAudioElement | null>,
) {
  if (!audioBase64) {
    return false;
  }

  pauseInterviewerPlayback(audioRef);

  const audio = audioRef.current ?? new Audio();
  audio.src = `data:application/octet-stream;base64,${audioBase64}`;
  audioRef.current = audio;

  try {
    await audio.play();

    return true;
  } catch {
    audio.pause();

    return false;
  }
}

export async function playInterviewerQuestion(
  audioBase64: string,
  question: string,
  audioRef: RefObject<HTMLAudioElement | null>,
) {
  pauseInterviewerPlayback(audioRef);

  if (audioBase64 && (await playAudioResponse(audioBase64, audioRef))) {
    return "provider" as const;
  }

  if (speakWithBrowser(question)) {
    return "browser" as const;
  }

  return null;
}

function pauseInterviewerPlayback(
  audioRef: RefObject<HTMLAudioElement | null>,
) {
  audioRef.current?.pause();
  window.speechSynthesis?.cancel();
}

export function stopInterviewerPlayback(
  audioRef: RefObject<HTMLAudioElement | null>,
) {
  const audio = audioRef.current;

  if (audio) {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
  }

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
