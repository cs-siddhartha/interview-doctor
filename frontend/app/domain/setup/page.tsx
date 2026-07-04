import { SetupPage } from "@/components/interview/setup-page";
import { DOMAIN_MODE } from "@/constants/interview-modes";
import { interviewModeById } from "@/lib/interview-options";
import { resolveProviderSelection } from "@/lib/provider-selection";
import { type SearchParamsRecord } from "@/lib/schemas/session";

type DomainSetupPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

export default async function DomainSetupPage({
  searchParams,
}: DomainSetupPageProps) {
  return (
    <SetupPage
      mode={interviewModeById.get(DOMAIN_MODE.id)!}
      providers={resolveProviderSelection(await searchParams)}
    />
  );
}
