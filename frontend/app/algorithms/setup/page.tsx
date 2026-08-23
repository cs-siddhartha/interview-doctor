import { SetupPage } from "@/components/interview/setup-page";
import { ALGORITHMS_MODE } from "@/constants/interview-modes";
import { interviewModeById } from "@/lib/interview-options";
import {
  resolveProviderSelection,
  resolveSessionTransport,
} from "@/lib/provider-selection";
import { type SearchParamsRecord } from "@/lib/schemas/session";

type AlgorithmsSetupPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

export default async function AlgorithmsSetupPage({
  searchParams,
}: AlgorithmsSetupPageProps) {
  const query = await searchParams;

  return (
    <SetupPage
      mode={interviewModeById.get(ALGORITHMS_MODE.id)!}
      providers={resolveProviderSelection(query)}
      transport={resolveSessionTransport(query)}
    />
  );
}
