import { notFound } from "next/navigation";

import { SessionPage } from "@/components/interview/session-page";
import { DOMAIN_MODE } from "@/constants/interview-modes";
import { getSession } from "@/lib/api/sessions";
import { interviewModeById } from "@/lib/interview-options";
import { resolveProviderSelectionFromValues } from "@/lib/provider-selection";
import { type SearchParamsRecord } from "@/lib/schemas/session";
import {
  buildProviderQueryFromSelection,
  resolveSessionId,
  resolveSessionSetupFromValues,
} from "@/lib/session-setup";

type DomainSessionPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

export default async function DomainSessionPage({
  searchParams,
}: DomainSessionPageProps) {
  const query = await searchParams;
  const sessionId = resolveSessionId(query);

  if (!sessionId) {
    notFound();
  }

  const session = await getSession(sessionId);

  if (!session || session.mode !== DOMAIN_MODE.id) {
    notFound();
  }

  const providers = resolveProviderSelectionFromValues(session.providers);

  return (
    <SessionPage
      mode={interviewModeById.get(DOMAIN_MODE.id)!}
      providers={providers}
      setup={resolveSessionSetupFromValues(DOMAIN_MODE.id, session.setup)}
      backHref={`${DOMAIN_MODE.setupPath}${buildProviderQueryFromSelection(providers)}`}
      sessionId={session.id}
    />
  );
}
