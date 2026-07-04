import { SessionPage } from "@/components/interview/session-page";
import { DOMAIN_MODE } from "@/constants/interview-modes";
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
      mode={interviewModeById.get(DOMAIN_MODE.id)!}
      providers={resolveProviderSelection(query)}
      setup={resolveSessionSetup(DOMAIN_MODE.id, query)}
      backHref={`${DOMAIN_MODE.setupPath}${buildProviderQuery(query)}`}
      sessionId={resolveSessionId(query)}
    />
  );
}
