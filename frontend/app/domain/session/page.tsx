import { SessionPage } from "@/components/interview/session-page";
import { interviewModeById } from "@/lib/interview-options";
import { resolveProviderSelection } from "@/lib/provider-selection";
import { type SearchParamsRecord } from "@/lib/schemas/session";
import {
  buildProviderQuery,
  resolveSessionId,
  resolveSessionSetup,
} from "@/lib/session-setup";

type DomainSessionPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

export default async function DomainSessionPage({
  searchParams,
}: DomainSessionPageProps) {
  const query = await searchParams;

  return (
    <SessionPage
      mode={interviewModeById.get("domain")!}
      providers={resolveProviderSelection(query)}
      setup={resolveSessionSetup("domain", query)}
      backHref={`/domain/setup${buildProviderQuery(query)}`}
      sessionId={resolveSessionId(query)}
    />
  );
}
