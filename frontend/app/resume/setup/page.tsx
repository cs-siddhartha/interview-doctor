import { SetupPage } from "@/components/interview/setup-page";
import { interviewModeById } from "@/lib/interview-options";
import {
  type SearchParamsRecord,
  resolveProviderSelection,
} from "@/lib/provider-selection";

type ResumeSetupPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

export default async function ResumeSetupPage({
  searchParams,
}: ResumeSetupPageProps) {
  return (
    <SetupPage
      mode={interviewModeById.get("resume")!}
      providers={resolveProviderSelection(await searchParams)}
    />
  );
}
