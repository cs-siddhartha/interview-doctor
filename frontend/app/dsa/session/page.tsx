import { notFound } from "next/navigation";

import { SessionPage } from "@/components/interview/session-page";
import { DSA_MODE } from "@/constants/interview-modes";
import { getSession } from "@/lib/api/sessions";
import { interviewModeById } from "@/lib/interview-options";
import { resolveProviderSelectionFromValues } from "@/lib/provider-selection";
import { type SearchParamsRecord } from "@/lib/schemas/session";
import {
  buildProviderQueryFromSelection,
  resolveSessionId,
  resolveSessionSetupFromValues,
} from "@/lib/session-setup";

type DsaSessionPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

export default async function DsaSessionPage({
  searchParams,
}: DsaSessionPageProps) {
  const query = await searchParams;
  const sessionId = resolveSessionId(query);

  if (!sessionId) {
    notFound();
  }

  const session = await getSession(sessionId);

  if (!session || session.mode !== DSA_MODE.id) {
    notFound();
  }

  const providers = resolveProviderSelectionFromValues(session.providers);

  return (
    <SessionPage
      mode={interviewModeById.get(DSA_MODE.id)!}
      providers={providers}
      setup={resolveSessionSetupFromValues(DSA_MODE.id, session.setup)}
      backHref={`${DSA_MODE.setupPath}${buildProviderQueryFromSelection(providers)}`}
      sessionId={session.id}
      transcript={session.transcript}
    />
  );
}
