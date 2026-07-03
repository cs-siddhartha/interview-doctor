import { SessionPage } from "@/components/interview/session-page";
import { interviewModeById } from "@/lib/interview-options";
import {
  type SearchParamsRecord,
  resolveProviderSelection,
} from "@/lib/provider-selection";
import { buildProviderQuery, resolveSessionSetup } from "@/lib/session-setup";

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
    />
  );
}
