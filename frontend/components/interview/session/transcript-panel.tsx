import { IconChecks, IconMessages } from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SESSION_COPY } from "@/constants/session";
import { type TranscriptTurn } from "@/lib/schemas/session";

type TranscriptPanelProps = {
  transcript: TranscriptTurn[];
};

export function TranscriptPanel({ transcript }: TranscriptPanelProps) {
  return (
    <Card className="overflow-hidden rounded-sm border-black/10 bg-white/75 py-0 shadow-none">
      <CardHeader className="border-b border-black/10 px-6 py-5 sm:px-8">
        <CardTitle className="flex items-center gap-3 text-2xl tracking-[-0.03em]">
          <span className="grid size-9 place-items-center rounded-full bg-[#171a1c] text-white">
            <IconMessages className="size-4" aria-hidden="true" />
          </span>
          {SESSION_COPY.transcriptTitle}
        </CardTitle>
        <CardDescription className="text-black/45">
          {SESSION_COPY.transcriptDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-[#e9e5dc] px-4 py-6 sm:px-8 sm:py-8">
        <div className="grid gap-3">
          {transcript.length > 0 ? (
            transcript.map((turn) => {
              const isInterviewer = turn.speaker === "ai_interviewer";

              return (
                <div
                  key={`${turn.speaker}-${turn.created_at}`}
                  className={`flex ${isInterviewer ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[84%] px-4 py-3 text-[#171a1c] shadow-sm sm:max-w-[72%] ${
                      isInterviewer
                        ? "rounded-2xl rounded-tl-sm bg-white"
                        : "rounded-2xl rounded-tr-sm bg-[#d9fdd3]"
                    }`}
                  >
                    <p
                      className={`mb-1 text-[0.65rem] font-semibold ${
                        isInterviewer ? "text-[#ca3f28]" : "text-[#327a4c]"
                      }`}
                    >
                      {isInterviewer ? "Interviewer" : "You"}
                    </p>
                    <p className="text-sm leading-6">{turn.text}</p>
                    {!isInterviewer ? (
                      <span className="mt-1 flex justify-end text-[#53a6d8]">
                        <IconChecks className="size-4" aria-label="Delivered" />
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-sm bg-white p-5 shadow-sm">
              <p className="mb-2 text-sm font-semibold">
                {SESSION_COPY.transcriptEmptyTitle}
              </p>
              <p className="text-sm leading-6 text-black/45">
                {SESSION_COPY.transcriptEmptyDescription}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
