import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTE_PATHS } from "@/constants/routes";
import { SETUP_COPY } from "@/constants/setup";
import { type InterviewMode } from "@/lib/interview-options";

type SetupHeaderProps = {
  mode: InterviewMode;
};

export function SetupHeader({ mode }: SetupHeaderProps) {
  const ModeIcon = mode.icon;

  return (
    <header className="space-y-5 border-b border-border pb-6">
      <Button asChild variant="outline">
        <Link href={ROUTE_PATHS.home} className="w-fit">
          <IconArrowLeft
            className="size-4"
            aria-hidden="true"
            data-icon="inline-start"
          />
          {SETUP_COPY.backLabel}
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex size-12 items-center justify-center bg-primary text-primary-foreground">
          <ModeIcon className="size-6" aria-hidden="true" />
        </div>
        <div className="max-w-2xl space-y-3">
          <Badge variant="outline" className="rounded-none uppercase">
            {mode.signal}
          </Badge>
          <h1 className="text-4xl font-semibold tracking-normal">
            {mode.title} {SETUP_COPY.titleSuffix}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {SETUP_COPY.description}
          </p>
        </div>
      </div>
    </header>
  );
}
