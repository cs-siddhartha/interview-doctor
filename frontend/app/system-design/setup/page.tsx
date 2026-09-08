import { SetupPage } from "@/components/interview/setup-page";
import { SYSTEM_DESIGN_MODE } from "@/constants/interview-modes";
import { interviewModeById } from "@/lib/interview-options";
import {
  resolveProviderSelection,
  resolveSessionTransport,
} from "@/lib/provider-selection";
import { type SearchParamsRecord } from "@/lib/schemas/session";

type SystemDesignSetupPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

export default async function SystemDesignSetupPage({
  searchParams,
}: SystemDesignSetupPageProps) {
  const query = await searchParams;

  return (
    <SetupPage
      mode={interviewModeById.get(SYSTEM_DESIGN_MODE.id)!}
      providers={resolveProviderSelection(query)}
      transport={resolveSessionTransport(query)}
    />
  );
}
