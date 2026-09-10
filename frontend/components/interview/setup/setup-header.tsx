import Link from "next/link";
import { IconArrowLeft, IconStethoscope } from "@tabler/icons-react";

import { APP_COPY } from "@/constants/app";
import { ROUTE_PATHS } from "@/constants/routes";
import { SETUP_COPY } from "@/constants/setup";
import { type InterviewMode } from "@/lib/interview-options";
import { MODE_PRESENTATION } from "@/lib/mode-presentation";

type SetupHeaderProps = {
  mode: InterviewMode;
};

export function SetupHeader({ mode }: SetupHeaderProps) {
  const ModeIcon = mode.icon;
  const presentation = MODE_PRESENTATION[mode.mode];

  return (
    <header className="space-y-5">
      <nav className="flex items-center justify-between py-2">
        <Link
          href={ROUTE_PATHS.home}
          className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em]"
        >
          <span className="grid size-9 place-items-center rounded-full bg-[#171a1c] text-white">
            <IconStethoscope className="size-5" aria-hidden="true" />
          </span>
          <span className="hidden sm:inline">{APP_COPY.brand}</span>
        </Link>
        <Link
          href={ROUTE_PATHS.home}
          className="flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-sm font-semibold transition-colors hover:bg-black/5"
        >
          <IconArrowLeft className="size-4" aria-hidden="true" />
          {SETUP_COPY.backLabel}
        </Link>
      </nav>

      <div
        className={`overflow-hidden rounded-sm border border-black/10 ${presentation.surface}`}
      >
        <div className="border-b border-black/10 px-6 py-4">
          <span className="font-mono text-sm font-semibold">
            {presentation.number}
          </span>
        </div>
        <div className="grid gap-5 px-6 py-6 sm:grid-cols-[auto_1fr] sm:items-center sm:px-8">
          <span className="grid size-11 place-items-center rounded-full bg-[#171a1c] text-white">
            <ModeIcon className="size-5" aria-hidden="true" />
          </span>
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold sm:text-4xl">
              {mode.title} {SETUP_COPY.titleSuffix}
            </h1>
            <p className="mt-2 text-sm leading-6 text-black/60">
              {SETUP_COPY.description}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
