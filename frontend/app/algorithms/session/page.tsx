import { notFound } from "next/navigation";

import { SessionPage } from "@/components/interview/session-page";
import { ALGORITHMS_MODE } from "@/constants/interview-modes";
import { getSession } from "@/lib/api/sessions";
import { interviewModeById } from "@/lib/interview-options";
import { resolveProviderSelectionFromValues } from "@/lib/provider-selection";
import { type SearchParamsRecord } from "@/lib/schemas/session";
import {
  buildProviderQueryFromSelection,
  resolveSessionId,
  resolveSessionSetupFromValues,
} from "@/lib/session-setup";

type AlgorithmsSessionPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

export default async function AlgorithmsSessionPage({
  searchParams,
}: AlgorithmsSessionPageProps) {
  const query = await searchParams;
  const sessionId = resolveSessionId(query);

  if (!sessionId) {
    notFound();
  }

  const session = await getSession(sessionId);

  if (!session || session.mode !== ALGORITHMS_MODE.id) {
    notFound();
  }

  const providers = resolveProviderSelectionFromValues(session.providers);

  return (
    <SessionPage
      mode={interviewModeById.get(ALGORITHMS_MODE.id)!}
      providers={providers}
      setup={resolveSessionSetupFromValues(ALGORITHMS_MODE.id, session.setup)}
      backHref={`${ALGORITHMS_MODE.setupPath}${buildProviderQueryFromSelection(providers)}`}
      sessionId={session.id}
      sessionState={session.state}
      transcript={session.transcript}
      openingAudioBase64={session.opening_audio_base64}
      openingAudioError={session.opening_audio_error}
    />
  );
}
