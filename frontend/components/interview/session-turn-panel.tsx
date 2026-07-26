"use client";

import { CompletedInterviewSummary } from "@/components/interview/session/completed-interview-summary";
import { TranscriptPanel } from "@/components/interview/session/transcript-panel";
import { VoiceSessionPanel } from "@/components/interview/session/voice-session-panel";
import { SESSION_COPY } from "@/constants/session";
import { useInterviewSession } from "@/hooks/use-interview-session";
import { type InterviewModeId } from "@/lib/interview-options";
import { type TranscriptTurn } from "@/lib/schemas/session";

type SessionTurnPanelProps = {
  modeSignal: string;
  modeId: InterviewModeId;
  sessionId: string;
  initialState: string;
  initialTranscript: TranscriptTurn[];
  initialAudioBase64: string;
  initialAudioError: string | null;
};

export function SessionTurnPanel({
  modeSignal,
  modeId,
  sessionId,
  initialState,
  initialTranscript,
  initialAudioBase64,
  initialAudioError,
}: SessionTurnPanelProps) {
  const session = useInterviewSession({
    sessionId,
    initialState,
    initialTranscript,
    initialAudioBase64,
    initialAudioError,
  });

  if (session.isEnded) {
    return (
      <CompletedInterviewSummary
        modeId={modeId}
        transcript={session.transcript}
      />
    );
  }

  return (
    <div className="space-y-6">
      <VoiceSessionPanel
        modeId={modeId}
        modeSignal={modeSignal}
        question={
          session.hasStarted
            ? session.currentQuestion ?? SESSION_COPY.waitingForQuestionMessage
            : SESSION_COPY.hiddenQuestionMessage
        }
        turnState={session.turnState}
        recorderState={session.recorderState}
        hasStarted={session.hasStarted}
        isBusy={session.isBusy}
        isEnding={session.isEnding}
        error={session.error}
        playbackNotice={session.playbackNotice}
        canPlayQuestion={Boolean(session.currentQuestion)}
        onPlayQuestion={session.playCurrentQuestion}
        onRecordButton={session.toggleRecording}
        onEndSession={session.endSession}
      />
      {session.hasStarted ? (
        <TranscriptPanel transcript={session.transcript} />
      ) : null}
    </div>
  );
}
