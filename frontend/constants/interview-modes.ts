export const INTERVIEW_MODE_IDS = [
  "resume",
  "domain",
  "algorithms",
  "system-design",
] as const;

export const RESUME_MODE = {
  id: INTERVIEW_MODE_IDS[0],
  title: "Resume Grilling",
  setupPath: "/resume/setup",
  description:
    "Upload a resume and let the interviewer challenge claims, projects, and experience depth.",
} as const;

export const DOMAIN_MODE = {
  id: INTERVIEW_MODE_IDS[1],
  title: "Domain Interview",
  setupPath: "/domain/setup",
  description:
    "Choose a role, skill, or topic and run a focused conversational interview.",
} as const;

export const ALGORITHMS_MODE = {
  id: INTERVIEW_MODE_IDS[2],
  title: "Algorithms Interview",
  setupPath: "/algorithms/setup",
  description:
    "Pick a data structures topic and practice explaining a solution while coding.",
} as const;

export const SYSTEM_DESIGN_MODE = {
  id: INTERVIEW_MODE_IDS[3],
  title: "System Design Interview",
  setupPath: "/system-design/setup",
  description:
    "Design a scalable system through a realistic, conversational interview.",
} as const;
