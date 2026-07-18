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
  badge: "Interview session",
  description:
    "This session starts from backend state and keeps provider choices, setup, transcript, and mode-specific workspace visible.",
  sessionIdLabel: "Session ID:",
  liveInterviewTitle: "Live interview",
  liveInterviewDescription: "Record an answer, send it to the selected providers, and listen to the AI follow-up.",
  metrics: {
    state: { label: "State", value: "Listening" },
    mode: { label: "Mode" },
    elapsed: { label: "Elapsed", value: "00:00" },
  },
  recordingStateLabel: "Recording",
  processingStateLabel: "Processing",
  audioTitle: "Ready for your answer",
  recordingAudioTitle: "Recording your answer",
  processingAudioTitle: "Processing provider turn",
  audioDescription:
    "Use the microphone control to capture one answer and run a complete STT, LLM, and TTS turn.",
  recordingAudioDescription: "Stop recording when you finish this answer.",
  processingAudioDescription: "The backend is transcribing, generating the follow-up, and synthesizing audio.",
  startTurnLabel: "Start recording",
  stopRecordingLabel: "Stop recording",
  turnInProgressLabel: "Processing turn",
  endSessionLabel: "End session",
  microphoneUnavailableMessage: "Microphone recording is not available in this browser.",
  microphonePermissionMessage: "Could not access the microphone.",
  emptyRecordingMessage: "No audio was captured.",
  turnErrorMessage: "Interview turn failed.",
  transcriptTitle: "Transcript",
  transcriptDescription: "Completed turns from this interview session.",
  transcriptEmptyTitle: "No turns yet.",
  transcriptEmptyDescription: "Record an answer to add the first transcript entries.",
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
      text: "Follow-up: explain the tradeoff behind your previous answer.",
    },
  ],
  codeWorkspaceTitle: "Code workspace",
  codeWorkspaceDescription:
    "Monaco and problem execution will be added after the backend skeleton.",
  codeWorkspacePlaceholder: `function solve(input) {
  return input
}`,
  setupSummaryTitle: "Setup",
  setupSummaryDescription: "Inputs carried from the setup page.",
  missingSetupValue: "Not set",
} as const;

export const SESSION_AUDIO = {
  mimeTypes: ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"] as const,
  fallbackMimeType: "audio/webm",
  base64Marker: "base64,",
} as const;
