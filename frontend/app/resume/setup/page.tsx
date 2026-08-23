import { SetupPage } from "@/components/interview/setup-page";
import { RESUME_MODE } from "@/constants/interview-modes";
import { interviewModeById } from "@/lib/interview-options";
import {
  resolveProviderSelection,
  resolveSessionTransport,
} from "@/lib/provider-selection";
import { type SearchParamsRecord } from "@/lib/schemas/session";

type ResumeSetupPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

export default async function ResumeSetupPage({
  searchParams,
}: ResumeSetupPageProps) {
  const query = await searchParams;

  return (
    <SetupPage
      mode={interviewModeById.get(RESUME_MODE.id)!}
      providers={resolveProviderSelection(query)}
      transport={resolveSessionTransport(query)}
    />
  );
}
