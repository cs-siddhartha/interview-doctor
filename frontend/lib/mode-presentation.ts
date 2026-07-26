import { type InterviewModeId } from "@/lib/interview-options";

type ModePresentation = {
  number: string;
  surface: string;
  softSurface: string;
};

export const MODE_PRESENTATION: Record<InterviewModeId, ModePresentation> = {
  resume: {
    number: "01",
    surface: "bg-[#d7ff66]",
    softSurface: "bg-[#efffc2]",
  },
  domain: {
    number: "02",
    surface: "bg-[#a8d8ff]",
    softSurface: "bg-[#dcefff]",
  },
  dsa: {
    number: "03",
    surface: "bg-[#ffb5a5]",
    softSurface: "bg-[#ffe0d9]",
  },
};
