import { type InterviewModeId } from "@/lib/interview-options";
import { type TranscriptTurn } from "@/lib/schemas/session";

export type RecorderState = "idle" | "recording" | "processing";

export type SessionExperienceProps = {
  modeTitle: string;
  modeId: InterviewModeId;
  sessionId: string;
  initialState: string;
  initialTranscript: TranscriptTurn[];
  initialAudioBase64: string;
  initialAudioError: string | null;
};
