import Link from "next/link";
import {
  IconArrowDownRight,
  IconMicrophone,
  IconSparkles,
  IconStethoscope,
} from "@tabler/icons-react";

import { APP_COPY } from "@/constants/app";

export function LandingHeader() {
  return (
    <header className="overflow-hidden border-b border-black/10 bg-[#f3f0e8]">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <span className="grid size-9 place-items-center rounded-full bg-[#171a1c] text-white">
            <IconStethoscope className="size-5" aria-hidden="true" />
          </span>
          <span className="text-sm uppercase tracking-[0.16em]">
            {APP_COPY.brand}
          </span>
        </Link>
        <span className="hidden items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-black/55 sm:flex">
          <span className="size-2 rounded-full bg-[#ef5b3f]" />
          Self hosted app
        </span>
      </nav>

      <div className="mx-auto grid w-full max-w-7xl gap-14 px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-10 lg:pb-24">
        <div className="max-w-3xl">
          <p className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#ca3f28]">
            <IconSparkles className="size-4" aria-hidden="true" />
            {APP_COPY.eyebrow}
          </p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.055em] text-[#171a1c] sm:text-7xl lg:text-[5.35rem]">
            {APP_COPY.headline}
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-black/60 sm:text-xl">
            {APP_COPY.description}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#interview-modes"
              className="inline-flex h-12 items-center justify-between gap-8 rounded-full bg-[#171a1c] px-6 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              {APP_COPY.primaryAction}
              <IconArrowDownRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex h-12 items-center justify-center rounded-full border border-black/20 px-6 text-sm font-semibold text-[#171a1c] transition-colors hover:bg-black/5"
            >
              {APP_COPY.secondaryAction}
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:mx-0">
          <div className="absolute -inset-5 rotate-2 rounded-[2rem] bg-[#d7ff66]" />
          <div className="relative overflow-hidden rounded-[1.65rem] border border-white/10 bg-[#171a1c] text-white shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                <span className="size-2 rounded-full bg-[#ef5b3f]" />
                {APP_COPY.previewLabel}
              </span>
              <span className="font-mono text-xs text-white/35">02:14</span>
            </div>
            <div className="space-y-5 p-5 sm:p-7">
              <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-white/10 p-4">
                <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#d7ff66]">
                  Interviewer
                </p>
                <p className="text-sm leading-6 text-white/90">
                  {APP_COPY.previewQuestion}
                </p>
              </div>
              <div className="ml-auto max-w-[82%] rounded-2xl rounded-tr-sm bg-white p-4 text-[#171a1c]">
                <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-black/45">
                  You
                </p>
                <p className="text-sm leading-6">{APP_COPY.previewAnswer}</p>
              </div>
              <div className="max-w-[82%] rounded-2xl rounded-tl-sm border border-[#d7ff66]/40 bg-[#d7ff66]/10 p-4">
                <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#d7ff66]">
                  Follow-up
                </p>
                <p className="text-sm leading-6 text-white/90">
                  {APP_COPY.previewFollowUp}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 border-t border-white/10 bg-black/20 px-5 py-5">
              <span className="grid size-10 place-items-center rounded-full bg-[#ef5b3f]">
                <IconMicrophone className="size-5" aria-hidden="true" />
              </span>
              <span className="text-sm text-white/65">
                {APP_COPY.previewStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
