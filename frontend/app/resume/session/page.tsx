import { notFound } from "next/navigation";

import { SessionPage } from "@/components/interview/session-page";
import { RESUME_MODE } from "@/constants/interview-modes";
import { getSession } from "@/lib/api/sessions";
import { interviewModeById } from "@/lib/interview-options";
import { resolveProviderSelectionFromValues } from "@/lib/provider-selection";
import { type SearchParamsRecord } from "@/lib/schemas/session";
import {
  buildProviderQueryFromSelection,
  resolveSessionId,
  resolveSessionSetupFromValues,
} from "@/lib/session-setup";

type ResumeSessionPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

export default async function ResumeSessionPage({
  searchParams,
}: ResumeSessionPageProps) {
  const query = await searchParams;
  const sessionId = resolveSessionId(query);

  if (!sessionId) {
    notFound();
  }

  const session = await getSession(sessionId);

  if (!session || session.mode !== RESUME_MODE.id) {
    notFound();
  }

  const providers = resolveProviderSelectionFromValues(session.providers);

  return (
    <SessionPage
      mode={interviewModeById.get(RESUME_MODE.id)!}
      providers={providers}
      transport={session.transport}
      setup={resolveSessionSetupFromValues(RESUME_MODE.id, session.setup)}
      backHref={`${RESUME_MODE.setupPath}${buildProviderQueryFromSelection(providers, session.transport)}`}
      sessionId={session.id}
      sessionState={session.state}
      transcript={session.transcript}
      openingAudioBase64={session.opening_audio_base64}
      openingAudioError={session.opening_audio_error}
      report={session.report}
      reportError={session.report_error}
    />
  );
}
