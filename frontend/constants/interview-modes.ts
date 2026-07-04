export const INTERVIEW_MODE_IDS = ["resume", "domain", "dsa"] as const;

export const RESUME_MODE = {
  id: INTERVIEW_MODE_IDS[0],
  title: "Resume Grilling",
  setupPath: "/resume/setup",
  signal: "Resume-aware",
  description:
    "Upload a resume and let the interviewer challenge claims, projects, and experience depth.",
} as const;

export const DOMAIN_MODE = {
  id: INTERVIEW_MODE_IDS[1],
  title: "Domain Interview",
  setupPath: "/domain/setup",
  signal: "Topic-driven",
  description:
    "Choose a role, skill, or topic and run a focused conversational interview.",
} as const;

export const DSA_MODE = {
  id: INTERVIEW_MODE_IDS[2],
  title: "DSA Interview",
  setupPath: "/dsa/setup",
  signal: "Code-assisted",
  description:
    "Pick a data structures topic and practice explaining a solution while coding.",
} as const;
