import Link from "next/link";
import { IconArrowUpRight, IconCheck } from "@tabler/icons-react";

import { MODE_CARD_COPY } from "@/constants/app";
import {
  type InterviewMode,
} from "@/lib/interview-options";
import { MODE_PRESENTATION } from "@/lib/mode-presentation";

type ModeCardProps = {
  mode: InterviewMode;
};

export function ModeCard({ mode }: ModeCardProps) {
  const presentation = MODE_PRESENTATION[mode.mode];
  const ModeIcon = mode.icon;

  return (
    <article
      className={`group flex min-h-[420px] flex-col overflow-hidden rounded-sm border border-black/10 ${presentation.surface}`}
    >
      <div className="border-b border-black/10 px-6 py-4">
        <span className="font-mono text-sm font-semibold">
          {presentation.number}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <span className="mb-8 grid size-12 place-items-center rounded-full bg-[#171a1c] text-white transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
          <ModeIcon className="size-6" aria-hidden="true" />
        </span>
        <h3 className="text-3xl font-semibold tracking-[-0.035em]">
          {mode.title}
        </h3>
        <p className="mt-3 min-h-20 text-sm leading-6 text-black/60">
          {mode.description}
        </p>
        <ul className="mt-6 space-y-2 border-t border-black/10 pt-5">
          {mode.highlights.map((highlight) => (
            <li key={highlight} className="flex items-center gap-2 text-sm">
              <IconCheck className="size-4" aria-hidden="true" />
              {highlight}
            </li>
          ))}
        </ul>
      </div>

      <Link
        href={mode.action}
        className="flex items-center justify-between border-t border-black/10 bg-white/30 px-6 py-5 text-sm font-semibold transition-colors hover:bg-white/55"
      >
        {MODE_CARD_COPY.startSetupLabel}
        <IconArrowUpRight
          className="size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </article>
  );
}
