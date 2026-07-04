import { SessionPage } from "@/components/interview/session-page";
import { RESUME_MODE } from "@/constants/interview-modes";
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
      mode={interviewModeById.get(RESUME_MODE.id)!}
      providers={resolveProviderSelection(query)}
      setup={resolveSessionSetup(RESUME_MODE.id, query)}
      backHref={`${RESUME_MODE.setupPath}${buildProviderQuery(query)}`}
      sessionId={resolveSessionId(query)}
    />
  );
}
