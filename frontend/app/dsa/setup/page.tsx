import { SetupPage } from "@/components/interview/setup-page";
import { DSA_MODE } from "@/constants/interview-modes";
import { interviewModeById } from "@/lib/interview-options";
import { resolveProviderSelection } from "@/lib/provider-selection";
import { type SearchParamsRecord } from "@/lib/schemas/session";

type DsaSetupPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

export default async function DsaSetupPage({ searchParams }: DsaSetupPageProps) {
  return (
    <SetupPage
      mode={interviewModeById.get(DSA_MODE.id)!}
      providers={resolveProviderSelection(await searchParams)}
    />
  );
}
