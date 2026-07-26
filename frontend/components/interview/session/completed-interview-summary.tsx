import { IconCircleCheck } from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SESSION_COPY } from "@/constants/session";
import { type InterviewModeId } from "@/lib/interview-options";
import { MODE_PRESENTATION } from "@/lib/mode-presentation";
import { type TranscriptTurn } from "@/lib/schemas/session";

import { StatusMetric } from "./status-metric";
import { TranscriptPanel } from "./transcript-panel";

type CompletedInterviewSummaryProps = {
  modeId: InterviewModeId;
  transcript: TranscriptTurn[];
};

export function CompletedInterviewSummary({
  modeId,
  transcript,
}: CompletedInterviewSummaryProps) {
  const candidateAnswers = transcript.filter(
    (turn) => turn.speaker === "candidate",
  ).length;
  const interviewerQuestions = transcript.filter(
    (turn) => turn.speaker === "ai_interviewer",
  ).length;
  const modeSurface = MODE_PRESENTATION[modeId].surface;

  return (
    <div className="space-y-6">
      <Card className={`overflow-hidden rounded-sm border-black/10 py-0 shadow-none ${modeSurface}`}>
        <CardHeader className="border-b border-black/10 px-6 py-7 sm:px-8">
          <span className="mb-4 grid size-12 place-items-center rounded-full bg-[#171a1c] text-white">
            <IconCircleCheck className="size-6" aria-hidden="true" />
          </span>
          <CardTitle className="text-4xl tracking-[-0.045em] sm:text-5xl">
            {SESSION_COPY.completedTitle}
          </CardTitle>
          <CardDescription className="max-w-xl text-black/55">
            {SESSION_COPY.completedDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 px-6 py-6 sm:grid-cols-2 sm:px-8">
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
