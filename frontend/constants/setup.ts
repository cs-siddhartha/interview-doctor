export const FORM_FIELD_NAMES = {
  mode: "mode",
  transport: "transport",
  resume: "resume",
  resumeDocumentId: "resumeDocumentId",
} as const;

export const RESUME_SETUP_FIELDS = {
  file: {
    label: "Resume file",
    name: FORM_FIELD_NAMES.resume,
    accept: ".pdf,application/pdf",
    uploadTitle: "Choose a PDF resume",
    uploadDescription: "PDF only · 10 MB maximum · 20 pages maximum",
  },
  targetRole: {
    label: "Target role",
    name: "targetRole",
    placeholder: "Senior frontend engineer",
  },
  intensity: {
    label: "Grilling intensity",
    name: "intensity",
    options: ["Balanced", "Strict", "Very strict"],
  },
} as const;

export const DOMAIN_SETUP_FIELDS = {
  topic: {
    label: "Interview domain",
    name: "domain",
    placeholder: "React performance, browser internals, behavioral...",
  },
  seniority: {
    label: "Seniority",
    name: "seniority",
    options: ["Junior", "Mid-level", "Senior", "Staff"],
  },
  style: {
    label: "Interview style",
    name: "style",
    options: ["Conversational", "Structured", "Rapid follow-up"],
  },
} as const;

export const ALGORITHMS_SETUP_FIELDS = {
  editorNotice: "Code editor and problem bank arrive with the session chunk.",
  topic: {
    label: "Topic",
    name: "topic",
    options: ["Arrays", "Strings", "Graphs", "Dynamic programming"],
  },
  difficulty: {
    label: "Difficulty",
    name: "difficulty",
    options: ["Easy", "Medium", "Hard"],
  },
  language: {
    label: "Preferred language",
    name: "language",
    placeholder: "TypeScript, Python, Java...",
  },
} as const;

export const SYSTEM_DESIGN_SETUP_FIELDS = {
  problem: {
    label: "Design problem (optional)",
    name: "problem",
    placeholder: "Leave blank for the interviewer to choose",
  },
  seniority: {
    label: "Seniority",
    name: "seniority",
    options: ["Mid-level", "Senior", "Staff"],
  },
} as const;

export const SETUP_COPY = {
  backLabel: "Back",
  titleSuffix: "setup",
  description:
    "Confirm the basic interview inputs before moving into the live session. This step keeps provider choices scoped to this interview.",
  providersTitle: "Provider configuration",
  providersDescription:
    "Audio goes to the selected speech service, transcripts and reports to the selected interviewer model, and questions to the selected voice service.",
  transportLabel: "Conversation mode",
  focusTitle: "Shape the pressure test",
  focusDescription:
    "Give the interviewer enough context to make every follow-up specific.",
  footerDescription: "Your interview room is ready when you are.",
  continueLabel: "Continue",
  submittingLabel: "Creating",
  invalidSetupMessage: "Check the setup fields and try again.",
  createSessionErrorMessage: "Could not create the interview session.",
  resumeUploadingLabel: "Reading resume",
  resumeReadyLabel: "Resume ready",
  resumeUploadError: "Could not process the resume.",
} as const;
