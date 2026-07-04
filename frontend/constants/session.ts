import {
  DOMAIN_SETUP_FIELDS,
  DSA_SETUP_FIELDS,
  RESUME_SETUP_FIELDS,
} from "@/constants/setup";

export const RESUME_SESSION_SETUP_FIELDS = [
  {
    key: RESUME_SETUP_FIELDS.targetRole.name,
    label: RESUME_SETUP_FIELDS.targetRole.label,
  },
  {
    key: RESUME_SETUP_FIELDS.intensity.name,
    label: RESUME_SETUP_FIELDS.intensity.label,
  },
] as const;

export const DOMAIN_SESSION_SETUP_FIELDS = [
  { key: DOMAIN_SETUP_FIELDS.topic.name, label: "Domain" },
  {
    key: DOMAIN_SETUP_FIELDS.seniority.name,
    label: DOMAIN_SETUP_FIELDS.seniority.label,
  },
  { key: DOMAIN_SETUP_FIELDS.style.name, label: "Style" },
] as const;

export const DSA_SESSION_SETUP_FIELDS = [
  { key: DSA_SETUP_FIELDS.topic.name, label: DSA_SETUP_FIELDS.topic.label },
  {
    key: DSA_SETUP_FIELDS.difficulty.name,
    label: DSA_SETUP_FIELDS.difficulty.label,
  },
  { key: DSA_SETUP_FIELDS.language.name, label: "Language" },
] as const;

export const SESSION_COPY = {
  providerStackTitle: "Provider stack",
  setupBackLabel: "Setup",
  badge: "Mock session",
  description:
    "This mock session shell now starts from a backend-created session and keeps layout, state, transcript, and mode-specific workspace visible.",
  sessionIdLabel: "Session ID:",
  liveInterviewTitle: "Live interview",
  liveInterviewDescription: "Turn-taking and audio streaming will connect here later.",
  metrics: {
    state: { label: "State", value: "Listening" },
    mode: { label: "Mode" },
    elapsed: { label: "Elapsed", value: "00:00" },
  },
  audioTitle: "Ready for mock audio",
  audioDescription:
    "The real session will stream microphone audio to the backend and play synthesized interviewer responses.",
  startTurnLabel: "Start mock turn",
  endSessionLabel: "End session",
  transcriptTitle: "Transcript",
  transcriptDescription: "Mock turns show the structure that streaming events will fill.",
  transcriptTurns: [
    {
      speaker: "AI interviewer",
      text: "Welcome. I will start with a focused question and adapt based on your answer.",
    },
    {
      speaker: "Candidate",
      text: "This is where the live transcript from streamed speech will appear.",
    },
    {
      speaker: "AI interviewer",
      text: "Mock follow-up: explain the tradeoff behind your previous answer.",
    },
  ],
  codeWorkspaceTitle: "Code workspace",
  codeWorkspaceDescription:
    "Monaco and problem execution will be added after the backend skeleton.",
  codeWorkspacePlaceholder: `function solve(input) {
  // Mock editor placeholder
  return input
}`,
  setupSummaryTitle: "Setup",
  setupSummaryDescription: "Inputs carried from the setup page.",
  missingSetupValue: "Not set",
} as const;
