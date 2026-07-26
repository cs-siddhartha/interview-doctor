import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SESSION_COPY } from "@/constants/session";
import { type TranscriptTurn } from "@/lib/schemas/session";

import { StatusMetric } from "./status-metric";
import { TranscriptPanel } from "./transcript-panel";

type CompletedInterviewSummaryProps = {
  transcript: TranscriptTurn[];
};

export function CompletedInterviewSummary({
  transcript,
}: CompletedInterviewSummaryProps) {
  const candidateAnswers = transcript.filter(
    (turn) => turn.speaker === "candidate",
  ).length;
  const interviewerQuestions = transcript.filter(
    (turn) => turn.speaker === "ai_interviewer",
  ).length;

  return (
    <div className="space-y-6">
      <Card className="rounded-none shadow-none">
        <CardHeader>
          <CardTitle>{SESSION_COPY.completedTitle}</CardTitle>
          <CardDescription>
            {SESSION_COPY.completedDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <StatusMetric
            label={SESSION_COPY.completedAnswersLabel}
            value={String(candidateAnswers)}
          />
          <StatusMetric
            label={SESSION_COPY.completedQuestionsLabel}
            value={String(interviewerQuestions)}
          />
        </CardContent>
      </Card>
      <TranscriptPanel transcript={transcript} />
    </div>
  );
}
