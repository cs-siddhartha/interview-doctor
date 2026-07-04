export const FORM_FIELD_NAMES = {
  mode: "mode",
  resume: "resume",
} as const;

export const RESUME_SETUP_FIELDS = {
  file: {
    label: "Resume file",
    name: FORM_FIELD_NAMES.resume,
    accept: ".pdf,.doc,.docx",
    uploadTitle: "Upload placeholder",
    uploadDescription: "PDF or DOCX parsing will be added in a later chunk.",
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
    placeholder: "React performance, system design, behavioral...",
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

export const DSA_SETUP_FIELDS = {
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

export const SETUP_COPY = {
  backLabel: "Back",
  titleSuffix: "setup",
  description:
    "Confirm the basic interview inputs before moving into the mock live session. This step keeps provider choices scoped to this interview.",
  footerDescription: "Continue into a mock session shell for this interview.",
  continueLabel: "Continue",
} as const;
