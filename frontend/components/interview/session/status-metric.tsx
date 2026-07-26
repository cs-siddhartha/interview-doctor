import { IconCircleFilled } from "@tabler/icons-react";

import { SESSION_COPY } from "@/constants/session";

type StatusMetricProps = {
  label: string;
  value: string;
};

export function StatusMetric({ label, value }: StatusMetricProps) {
  return (
    <div className="grid gap-1 border border-border bg-background p-3">
      <span className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </span>
      <span className="flex items-center gap-2 text-sm font-medium">
        {label === SESSION_COPY.metrics.state.label ? (
          <IconCircleFilled className="size-2 text-primary" aria-hidden="true" />
        ) : null}
        {value}
      </span>
    </div>
  );
}
