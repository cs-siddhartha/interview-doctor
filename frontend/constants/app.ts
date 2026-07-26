export const APP_COPY = {
  brand: "Interview Doctor",
  eyebrow: "Voice-first AI interview simulator",
  headline: "Pressure-test your answers before the real interview.",
  description:
    "Practice out loud with an interviewer that challenges vague claims, digs into technical decisions, and asks the follow-up you hoped it would skip.",
  primaryAction: "Choose your interview",
  secondaryAction: "See how it works",
  previewLabel: "Live pressure test",
  previewQuestion:
    "You said performance improved. What changed, and how did you measure it?",
  previewAnswer: "We cut LCP from 4.1s to 1.8s by moving...",
  previewFollowUp: "What trade-off did that introduce?",
  previewStatus: "Interviewer is listening",
  modesEyebrow: "Choose your pressure test",
  modesTitle: "Practice for the interview you actually have.",
  modesDescription:
    "Each mode changes what the interviewer probes, so the questions stay relevant instead of turning into generic AI small talk.",
  workflowEyebrow: "One focused loop",
  workflowTitle: "Set the target. Speak your answer. Review the evidence.",
  interviewModesAriaLabel: "Interview modes",
} as const;

export const MODE_CARD_COPY = {
  startSetupLabel: "Configure interview",
} as const;

export const LANDING_METRICS = [
  { value: "03", label: "Focused modes" },
  { value: "Voice", label: "Practice out loud" },
  { value: "Live", label: "Adaptive follow-ups" },
] as const;

export const LANDING_WORKFLOW = [
  {
    step: "01",
    title: "Set the target",
    description: "Choose the role, topic, difficulty, and provider stack.",
  },
  {
    step: "02",
    title: "Answer out loud",
    description: "Practice the delivery, not just the idea in your head.",
  },
  {
    step: "03",
    title: "Review the evidence",
    description: "Use the transcript and summary to tighten every answer.",
  },
] as const;

export const APP_METADATA = {
  title: "Interview Doctor",
  description: "Practice focused interviews against an AI interviewer.",
  htmlLang: "en",
} as const;
