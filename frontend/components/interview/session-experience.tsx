"use client";

import dynamic from "next/dynamic";

import { type SessionExperienceProps } from "@/components/interview/session/session-types";
import { type SessionTransportValue } from "@/lib/schemas/interview";

const BatchSession = dynamic(() =>
  import("@/components/interview/session-turn-panel").then(
    (module) => module.SessionTurnPanel,
  ),
);
const RealtimeSession = dynamic(
  () =>
    import("@/components/interview/realtime-session-turn-panel").then(
      (module) => module.RealtimeSessionTurnPanel,
    ),
  { ssr: false },
);

type SessionExperienceSelectorProps = SessionExperienceProps & {
  transport: SessionTransportValue;
};

// Keeps browser-only realtime audio code out of the turn-based bundle while
// preserving the existing batch session as an independent implementation.
export function SessionExperience({
  transport,
  ...sessionProps
}: SessionExperienceSelectorProps) {
  return transport === "websocket" ? (
    <RealtimeSession {...sessionProps} />
  ) : (
    <BatchSession {...sessionProps} />
  );
}
