import { SessionPage } from "@/components/interview/session-page";
import { interviewModeById } from "@/lib/interview-options";
import { resolveProviderSelection } from "@/lib/provider-selection";
import { type SearchParamsRecord } from "@/lib/schemas/session";
import {
  buildProviderQuery,
  resolveSessionId,
  resolveSessionSetup,
} from "@/lib/session-setup";

type ResumeSessionPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

export default async function ResumeSessionPage({
  searchParams,
}: ResumeSessionPageProps) {
  const query = await searchParams;

  return (
    <SessionPage
      mode={interviewModeById.get("resume")!}
      providers={resolveProviderSelection(query)}
      setup={resolveSessionSetup("resume", query)}
      backHref={`/resume/setup${buildProviderQuery(query)}`}
      sessionId={resolveSessionId(query)}
    />
  );
}
