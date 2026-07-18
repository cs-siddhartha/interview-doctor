"use client";

import { useActionState } from "react";
import { IconChevronRight } from "@tabler/icons-react";

import {
  createSessionFromSetup,
  initialCreateSessionActionState,
} from "@/app/actions/sessions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FORM_FIELD_NAMES, SETUP_COPY } from "@/constants/setup";
import { type InterviewMode, providerFields } from "@/lib/interview-options";
import { type ProviderSelection } from "@/lib/provider-selection";

import { SetupFields } from "./setup-fields";

type SetupFormProps = {
  mode: InterviewMode;
  providers: ProviderSelection;
};

export function SetupForm({ mode, providers }: SetupFormProps) {
  const [state, formAction, isPending] = useActionState(
    createSessionFromSetup,
    initialCreateSessionActionState,
  );

  return (
    <form action={formAction}>
      <Card className="rounded-none shadow-none">
        {providerFields.map((field) => (
          <input
            key={field.id}
            type="hidden"
            name={field.id}
            value={providers[field.id].value}
          />
        ))}
        {providerFields.map((field) => (
          <input
            key={`${field.id}-transport`}
            type="hidden"
            name={`${field.id}Transport`}
            value={providers[field.id].transport}
          />
        ))}
        <input type="hidden" name={FORM_FIELD_NAMES.mode} value={mode.mode} />

        <CardContent className="grid gap-5">
          <SetupFields mode={mode.mode} />
          {state.error ? (
            <p className="border border-destructive/40 bg-destructive/5 p-3 text-sm font-medium text-destructive">
              {state.error}
            </p>
          ) : null}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-muted-foreground">
            {SETUP_COPY.footerDescription}
          </p>
          <Button
            type="submit"
            className="h-10 justify-between sm:w-48"
            disabled={isPending}
          >
            {isPending ? SETUP_COPY.submittingLabel : SETUP_COPY.continueLabel}
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
