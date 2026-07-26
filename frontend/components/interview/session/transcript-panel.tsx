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
    <Card className="rounded-none shadow-none">
      <CardHeader>
        <CardTitle>{SESSION_COPY.transcriptTitle}</CardTitle>
        <CardDescription>
          {SESSION_COPY.transcriptDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {transcript.length > 0 ? (
          transcript.map((turn) => (
            <div
              key={`${turn.speaker}-${turn.created_at}`}
              className="border border-border bg-background p-4"
            >
              <p className="mb-2 text-xs font-medium uppercase tracking-normal text-muted-foreground">
                {turn.speaker}
              </p>
              <p className="text-sm leading-6">{turn.text}</p>
            </div>
          ))
        ) : (
          <div className="border border-border bg-background p-4">
            <p className="mb-2 text-sm font-medium">
              {SESSION_COPY.transcriptEmptyTitle}
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              {SESSION_COPY.transcriptEmptyDescription}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
