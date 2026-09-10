import { IconCircleCheck } from "@tabler/icons-react";

import { deleteInterviewData } from "@/app/actions/delete-session";
import { Button } from "@/components/ui/button";
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
import {
  type InterviewReport,
  type TranscriptTurn,
} from "@/lib/schemas/session";

import { StatusMetric } from "./status-metric";
import { TranscriptPanel } from "./transcript-panel";

type CompletedInterviewSummaryProps = {
  modeId: InterviewModeId;
  transcript: TranscriptTurn[];
  report: InterviewReport | null;
  reportError: string | null;
  sessionId: string;
};

export function CompletedInterviewSummary({
  modeId,
  transcript,
  report,
  reportError,
  sessionId,
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
      <section className="border-y border-black/10 py-7" aria-labelledby="report-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="report-title" className="text-2xl font-semibold">
              {SESSION_COPY.reportTitle}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-black/65">
              {report ? report.summary : reportError ?? SESSION_COPY.reportUnavailable}
            </p>
          </div>
          {report ? (
            <p className="shrink-0 text-4xl font-semibold tabular-nums">
              {report.overall_score}
              <span className="text-base font-normal text-black/45">/100</span>
            </p>
          ) : null}
        </div>

        {report ? (
          <div className="mt-7 space-y-7">
            <div className="grid gap-3 lg:grid-cols-2">
              {report.categories.map((category, categoryIndex) => (
                <article
                  key={`${category.name}-${categoryIndex}`}
                  className="rounded-sm border border-black/10 bg-white/45 p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold">{category.name}</h3>
                    <span className="font-mono text-sm text-black/55">
                      {category.score}/5
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-black/65">
                    {category.rationale}
                  </p>
                  <p className="mt-5 text-xs font-semibold uppercase text-black/40">
                    {SESSION_COPY.reportEvidenceLabel}
                  </p>
                  <div className="mt-2 space-y-2">
                    {category.evidence.map((evidence) => (
                      <blockquote
                        key={`${category.name}-${evidence.turn_index}`}
                        className="border-l-2 border-black/20 pl-3 text-sm italic text-black/60"
                      >
                        &ldquo;{evidence.quote}&rdquo;
                      </blockquote>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            <div className="grid gap-7 md:grid-cols-2">
              <div>
                <h3 className="font-semibold">{SESSION_COPY.reportStrengthsTitle}</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-black/65">
                  {report.strengths.map((strength, strengthIndex) => (
                    <li
                      key={`${strength}-${strengthIndex}`}
                      className="border-l-2 border-[#7ac7a2] pl-3"
                    >
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">
                  {SESSION_COPY.reportImprovementsTitle}
                </h3>
                <div className="mt-3 space-y-3">
                  {report.improvements.map((improvement, improvementIndex) => (
                    <div
                      key={`${improvement.area}-${improvementIndex}`}
                      className="text-sm leading-6"
                    >
                      <p className="font-semibold">{improvement.area}</p>
                      <p className="text-black/60">{improvement.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>
      <TranscriptPanel transcript={transcript} />
      <form
        action={deleteInterviewData.bind(null, sessionId)}
        className="flex items-center justify-between gap-5 border-t border-black/10 pt-5"
      >
        <p className="text-xs leading-5 text-black/50">
          Permanently remove this transcript, report, and linked resume data.
        </p>
        <Button type="submit" variant="outline" className="shrink-0">
          Delete interview data
        </Button>
      </form>
    </div>
  );
}
