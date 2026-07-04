import { SessionPage } from "@/components/interview/session-page";
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
      mode={interviewModeById.get("dsa")!}
      providers={resolveProviderSelection(query)}
      setup={resolveSessionSetup("dsa", query)}
      backHref={`/dsa/setup${buildProviderQuery(query)}`}
      sessionId={resolveSessionId(query)}
    />
  );
}
