import { SetupPage } from "@/components/interview/setup-page";
import { interviewModeById } from "@/lib/interview-options";
import {
  type SearchParamsRecord,
  resolveProviderSelection,
} from "@/lib/provider-selection";

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
