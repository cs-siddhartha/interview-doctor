import Link from "next/link";
import { IconArrowUpRight, IconStethoscope } from "@tabler/icons-react";

import { APP_COPY, LANDING_WORKFLOW } from "@/constants/app";

export function LandingWorkflow() {
  return (
    <section id="how-it-works" className="bg-[#171a1c] text-white">
      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#d7ff66]">
              {APP_COPY.workflowEyebrow}
            </p>
            <h2 className="max-w-xl text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
              {APP_COPY.workflowTitle}
            </h2>
          </div>

          <ol className="border-t border-white/15">
            {LANDING_WORKFLOW.map((item) => (
              <li
                key={item.step}
                className="grid gap-3 border-b border-white/15 py-6 sm:grid-cols-[4rem_1fr_1.2fr] sm:items-baseline"
              >
                <span className="font-mono text-xs text-[#d7ff66]">
                  {item.step}
                </span>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm leading-6 text-white/50">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <footer className="mt-20 flex flex-col gap-6 border-t border-white/15 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.14em]">
            <IconStethoscope className="size-5 text-[#d7ff66]" aria-hidden="true" />
            {APP_COPY.brand}
          </span>
          <Link
            href="#interview-modes"
            className="flex items-center gap-2 text-sm font-semibold text-white/70 transition-colors hover:text-white"
          >
            Choose a practice mode
            <IconArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </footer>
      </div>
    </section>
  );
}
