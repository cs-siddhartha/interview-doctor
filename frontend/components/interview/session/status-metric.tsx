import { IconCircleFilled } from "@tabler/icons-react";

import { SESSION_COPY } from "@/constants/session";

type StatusMetricProps = {
  label: string;
  value: string;
  tone?: "light" | "dark";
};

export function StatusMetric({
  label,
  value,
  tone = "light",
}: StatusMetricProps) {
  const isDark = tone === "dark";

  return (
    <div
      className={`grid gap-1 rounded-xl border p-3 sm:p-4 ${
        isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-white/55"
      }`}
    >
      <span
        className={`text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${
          isDark ? "text-white/35" : "text-black/40"
        }`}
      >
        {label}
      </span>
      <span
        className={`flex items-center gap-1 text-xs font-semibold sm:gap-2 sm:text-sm ${
          isDark ? "text-white" : "text-[#171a1c]"
        }`}
      >
        {label === SESSION_COPY.metrics.state.label ? (
          <IconCircleFilled className="size-2 text-[#d7ff66]" aria-hidden="true" />
        ) : null}
        {value}
      </span>
    </div>
  );
}
