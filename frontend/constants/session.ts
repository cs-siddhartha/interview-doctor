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
  providerStackTitle: "Interview stack",
  setupBackLabel: "Setup",
  badge: "Interview session",
  description:
    "Stay specific and think out loud. Every answer decides what the interviewer challenges next.",
  sessionIdLabel: "Room",
  liveInterviewTitle: "Live interview",
  liveInterviewDescription:
    "Answer naturally—the next question is built from what you say.",
  metrics: {
    state: { label: "State", value: "Listening" },
    mode: { label: "Mode" },
    elapsed: { label: "Elapsed", value: "00:00" },
  },
  recordingStateLabel: "Recording",
  processingStateLabel: "Processing",
  audioTitle: "Ready for your answer",
  interviewerReadyTitle: "Your interviewer is ready",
  recordingAudioTitle: "Recording your answer",
  processingAudioTitle: "Processing provider turn",
  audioDescription:
    "Take a breath, structure the answer, then speak when you are ready.",
  interviewerReadyDescription:
    "Start the interview to hear the opening question and unlock voice playback.",
  recordingAudioDescription: "Stop recording when you finish this answer.",
  processingAudioDescription: "The backend is transcribing, generating the follow-up, and synthesizing audio.",
  playQuestionLabel: "Play question",
  startInterviewLabel: "Start interview",
  followUpReadyMessage: "The next question is ready. Press Play question to hear it.",
  browserVoiceFallbackMessage: "Using the browser voice because provider audio is unavailable.",
  serverVoiceFallbackMessage: "Using OpenAI speech because the selected TTS provider rejected the request.",
  audioPlaybackErrorMessage: "The interviewer audio could not be played.",
  waitingForQuestionMessage: "Preparing the interviewer question...",
  startTurnLabel: "Start recording",
  stopRecordingLabel: "Stop recording",
  turnInProgressLabel: "Processing turn",
  endSessionLabel: "End session",
  endingSessionLabel: "Ending session",
  endSessionError: "Could not end the interview session.",
  completedTitle: "Interview complete",
  completedDescription:
    "The room is closed. Review where your answers were specific—and where the interviewer had to keep digging.",
  completedAnswersLabel: "Candidate answers",
  completedQuestionsLabel: "Interviewer questions",
  microphoneUnavailableMessage: "Microphone recording is not available in this browser.",
  microphonePermissionMessage: "Could not access the microphone.",
  emptyRecordingMessage: "No audio was captured.",
  turnErrorMessage: "Interview turn failed.",
  transcriptTitle: "Transcript",
  transcriptDescription: "Your interview, turn by turn.",
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
    "Use this space to outline the solution while you explain your reasoning.",
  codeWorkspacePlaceholder: `function solve(input) {
  return input
}`,
  setupSummaryTitle: "Your brief",
  setupSummaryDescription: "The context shaping this interview.",
  missingSetupValue: "Not set",
} as const;

export const SESSION_STATES = {
  ended: "session_end",
} as const;

export const SESSION_AUDIO = {
  mimeTypes: ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"] as const,
  fallbackMimeType: "audio/webm",
  base64Marker: "base64,",
} as const;
