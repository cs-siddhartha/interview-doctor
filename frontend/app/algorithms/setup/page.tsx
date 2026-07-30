import { SetupPage } from "@/components/interview/setup-page";
import { ALGORITHMS_MODE } from "@/constants/interview-modes";
import { interviewModeById } from "@/lib/interview-options";
import { resolveProviderSelection } from "@/lib/provider-selection";
import { type SearchParamsRecord } from "@/lib/schemas/session";

type AlgorithmsSetupPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

export default async function AlgorithmsSetupPage({
  searchParams,
}: AlgorithmsSetupPageProps) {
  return (
    <SetupPage
      mode={interviewModeById.get(ALGORITHMS_MODE.id)!}
      providers={resolveProviderSelection(await searchParams)}
    />
  );
}
