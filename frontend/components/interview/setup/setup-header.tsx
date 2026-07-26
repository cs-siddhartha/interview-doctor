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
        className={`overflow-hidden rounded-[2rem] border border-black/10 ${presentation.surface}`}
      >
        <div className="border-b border-black/10 px-6 py-4">
          <span className="font-mono text-sm font-semibold">
            {presentation.number}
          </span>
        </div>
        <div className="grid gap-8 px-6 py-8 sm:px-9 sm:py-10 lg:grid-cols-[auto_1fr_320px] lg:items-end">
          <span className="grid size-14 place-items-center rounded-full bg-[#171a1c] text-white">
            <ModeIcon className="size-7" aria-hidden="true" />
          </span>
          <div className="max-w-2xl">
            <h1 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
              {mode.title} {SETUP_COPY.titleSuffix}
            </h1>
            <p className="mt-4 text-base leading-7 text-black/60">
              {SETUP_COPY.description}
            </p>
          </div>
          <ol className="grid grid-cols-3 gap-4">
            <li className="border-t-2 border-black pt-3">
              <span className="block font-mono text-xs font-semibold">01</span>
              <span className="mt-1 block text-[0.65rem] font-semibold uppercase tracking-[0.12em]">
                Configure
              </span>
            </li>
            <li className="border-t border-black/20 pt-3 text-black/40">
              <span className="block font-mono text-xs font-semibold">02</span>
              <span className="mt-1 block text-[0.65rem] font-semibold uppercase tracking-[0.12em]">
                Practice
              </span>
            </li>
            <li className="border-t border-black/20 pt-3 text-black/40">
              <span className="block font-mono text-xs font-semibold">03</span>
              <span className="mt-1 block text-[0.65rem] font-semibold uppercase tracking-[0.12em]">
                Review
              </span>
            </li>
          </ol>
        </div>
      </div>
    </header>
  );
}
