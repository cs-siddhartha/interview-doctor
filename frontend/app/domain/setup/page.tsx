import { SetupPage } from "@/components/interview/setup-page";
import { interviewModeById } from "@/lib/interview-options";
import {
  type SearchParamsRecord,
  resolveProviderSelection,
} from "@/lib/provider-selection";

type DomainSetupPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

export default async function DomainSetupPage({
  searchParams,
}: DomainSetupPageProps) {
  return (
    <SetupPage
      mode={interviewModeById.get("domain")!}
      providers={resolveProviderSelection(await searchParams)}
    />
  );
}
