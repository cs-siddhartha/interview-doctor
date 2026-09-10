"use client";

import { CompletedInterviewSummary } from "@/components/interview/session/completed-interview-summary";
import { TranscriptPanel } from "@/components/interview/session/transcript-panel";
import { VoiceSessionPanel } from "@/components/interview/session/voice-session-panel";
import { type SessionExperienceProps } from "@/components/interview/session/session-types";
import { SESSION_COPY } from "@/constants/session";
import { useInterviewSession } from "@/hooks/use-interview-session";

export function SessionTurnPanel({
  modeTitle,
  modeId,
  sessionId,
  initialState,
  initialTranscript,
  initialAudioBase64,
  initialAudioError,
  initialReport,
  initialReportError,
}: SessionExperienceProps) {
  const session = useInterviewSession({
    sessionId,
    initialState,
    initialTranscript,
    initialAudioBase64,
    initialAudioError,
    initialReport,
    initialReportError,
  });

  if (session.isEnded) {
    return (
      <CompletedInterviewSummary
        modeId={modeId}
        transcript={session.transcript}
        report={session.report}
        reportError={session.reportError}
        sessionId={sessionId}
      />
    );
  }

  return (
    <div className="space-y-6">
      <VoiceSessionPanel
        modeId={modeId}
        modeTitle={modeTitle}
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
        audioLevelRef={session.audioLevelRef}
        canPlayQuestion={
          Boolean(session.currentQuestion) &&
          session.recorderState !== "recording"
        }
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
