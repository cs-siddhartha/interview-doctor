import { IconChevronRight } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { type InterviewMode, providerFields } from "@/lib/interview-options";
import { type ProviderSelection } from "@/lib/provider-selection";

import { SetupFields } from "./setup-fields";

type SetupFormProps = {
  mode: InterviewMode;
  providers: ProviderSelection;
};

export function SetupForm({ mode, providers }: SetupFormProps) {
  return (
    <form action={`/${mode.mode}/session`}>
      <Card className="rounded-none shadow-none">
        {providerFields.map((field) => (
          <input
            key={field.id}
            type="hidden"
            name={field.id}
            value={providers[field.id].value}
          />
        ))}
        <input type="hidden" name="mode" value={mode.mode} />

        <CardContent className="grid gap-5">
          <SetupFields mode={mode.mode} />
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-muted-foreground">
            Continue into a mock session shell for this interview.
          </p>
          <Button type="submit" className="h-10 justify-between sm:w-48">
            Continue
            <IconChevronRight
              className="size-4"
              aria-hidden="true"
              data-icon="inline-end"
            />
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
