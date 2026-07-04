import { SetupPage } from "@/components/interview/setup-page";
import { interviewModeById } from "@/lib/interview-options";
import { resolveProviderSelection } from "@/lib/provider-selection";
import { type SearchParamsRecord } from "@/lib/schemas/session";

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
