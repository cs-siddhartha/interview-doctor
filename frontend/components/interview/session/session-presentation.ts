import { SESSION_COPY } from "@/constants/session";

import { type RecorderState } from "./session-types";

type AudioPresentationState = RecorderState | "ready";

type AudioPresentation = {
  title: string;
  description: string;
};

export const AUDIO_PRESENTATION = {
  ready: {
    title: SESSION_COPY.interviewerReadyTitle,
    description: SESSION_COPY.interviewerReadyDescription,
  },
  idle: {
    title: SESSION_COPY.audioTitle,
    description: SESSION_COPY.audioDescription,
  },
  recording: {
    title: SESSION_COPY.recordingAudioTitle,
    description: SESSION_COPY.recordingAudioDescription,
  },
  processing: {
    title: SESSION_COPY.processingAudioTitle,
    description: SESSION_COPY.processingAudioDescription,
  },
} satisfies Record<AudioPresentationState, AudioPresentation>;
