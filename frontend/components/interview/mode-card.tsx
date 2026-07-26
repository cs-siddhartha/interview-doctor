import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MODE_CARD_COPY } from "@/constants/app";
import { type InterviewMode } from "@/lib/interview-options";

type ModeCardProps = {
  mode: InterviewMode;
};

export function ModeCard({ mode }: ModeCardProps) {
  return (
    <Card className="min-h-72 rounded-none shadow-none">
      <CardHeader className="gap-5">
        <CardAction>
          <Badge variant="outline" className="rounded-none uppercase">
            {mode.signal}
          </Badge>
        </CardAction>
        <div className="space-y-3">
          <CardTitle className="text-2xl font-semibold tracking-normal">
            {mode.title}
          </CardTitle>
          <CardDescription className="min-h-[78px] leading-6">
            {mode.description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardFooter className="mt-auto border-t">
        <Button asChild className="h-10 w-full justify-between">
          <Link href={mode.action}>
            {MODE_CARD_COPY.startSetupLabel}
            <IconChevronRight
              className="size-4"
              aria-hidden="true"
              data-icon="inline-end"
            />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
