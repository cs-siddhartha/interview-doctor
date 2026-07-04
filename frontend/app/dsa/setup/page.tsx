import { SetupPage } from "@/components/interview/setup-page";
import { interviewModeById } from "@/lib/interview-options";
import { resolveProviderSelection } from "@/lib/provider-selection";
import { type SearchParamsRecord } from "@/lib/schemas/session";

type DsaSetupPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

export default async function DsaSetupPage({ searchParams }: DsaSetupPageProps) {
  return (
    <SetupPage
      mode={interviewModeById.get("dsa")!}
      providers={resolveProviderSelection(await searchParams)}
    />
  );
}
