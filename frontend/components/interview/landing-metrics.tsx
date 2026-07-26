import { LANDING_METRICS } from "@/constants/app";

export function LandingMetrics() {
  return (
    <section
      aria-label="Product highlights"
      className="border-b border-black/10 bg-[#f3f0e8]"
    >
      <div className="mx-auto grid w-full max-w-7xl divide-y divide-black/10 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8 lg:px-10">
        {LANDING_METRICS.map((metric) => (
          <div key={metric.label} className="flex items-baseline gap-3 py-6 sm:px-6">
            <span className="text-2xl font-semibold tracking-[-0.04em]">
              {metric.value}
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-black/45">
              {metric.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
