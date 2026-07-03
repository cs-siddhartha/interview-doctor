import { SessionPage } from "@/components/interview/session-page";
import { interviewModeById } from "@/lib/interview-options";
import {
  type SearchParamsRecord,
  resolveProviderSelection,
} from "@/lib/provider-selection";
import { buildProviderQuery, resolveSessionSetup } from "@/lib/session-setup";

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
    />
  );
}
