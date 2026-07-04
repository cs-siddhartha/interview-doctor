import { SessionPage } from "@/components/interview/session-page";
import { DSA_MODE } from "@/constants/interview-modes";
import { interviewModeById } from "@/lib/interview-options";
import { resolveProviderSelection } from "@/lib/provider-selection";
import { type SearchParamsRecord } from "@/lib/schemas/session";
import {
  buildProviderQuery,
  resolveSessionId,
  resolveSessionSetup,
} from "@/lib/session-setup";

type DsaSessionPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

export default async function DsaSessionPage({
  searchParams,
}: DsaSessionPageProps) {
  const query = await searchParams;

  return (
    <SessionPage
      mode={interviewModeById.get(DSA_MODE.id)!}
      providers={resolveProviderSelection(query)}
      setup={resolveSessionSetup(DSA_MODE.id, query)}
      backHref={`${DSA_MODE.setupPath}${buildProviderQuery(query)}`}
      sessionId={resolveSessionId(query)}
    />
  );
}
