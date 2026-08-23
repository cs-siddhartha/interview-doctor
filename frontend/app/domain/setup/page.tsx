import { SetupPage } from "@/components/interview/setup-page";
import { DOMAIN_MODE } from "@/constants/interview-modes";
import { interviewModeById } from "@/lib/interview-options";
import {
  resolveProviderSelection,
  resolveSessionTransport,
} from "@/lib/provider-selection";
import { type SearchParamsRecord } from "@/lib/schemas/session";

type DomainSetupPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

export default async function DomainSetupPage({
  searchParams,
}: DomainSetupPageProps) {
  const query = await searchParams;

  return (
    <SetupPage
      mode={interviewModeById.get(DOMAIN_MODE.id)!}
      providers={resolveProviderSelection(query)}
      transport={resolveSessionTransport(query)}
    />
  );
}
