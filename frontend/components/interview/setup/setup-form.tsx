"use client";

import { useActionState } from "react";
import { IconChevronRight } from "@tabler/icons-react";

import {
  createSessionFromSetup,
  type CreateSessionActionState,
} from "@/app/actions/sessions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FORM_FIELD_NAMES, SETUP_COPY } from "@/constants/setup";
import { type InterviewModeId } from "@/lib/interview-options";
import { type ProviderSelection } from "@/lib/provider-selection";

import { ProviderControls } from "./provider-controls";
import { SetupFields } from "./setup-fields";

type SetupFormProps = {
  modeId: InterviewModeId;
  providers: ProviderSelection;
};

const initialCreateSessionActionState: CreateSessionActionState = {
  error: null,
};

export function SetupForm({ modeId, providers }: SetupFormProps) {
  const [state, formAction, isPending] = useActionState(
    createSessionFromSetup,
    initialCreateSessionActionState,
  );

  return (
    <form action={formAction}>
      <Card className="overflow-hidden rounded-[2rem] border-black/10 bg-white/75 py-0 shadow-xl shadow-black/5">
        <input type="hidden" name={FORM_FIELD_NAMES.mode} value={modeId} />

        <CardContent className="grid gap-8 p-6 sm:p-9">
          <ProviderControls providers={providers} />
          <SetupFields mode={modeId} />
          {state.error ? (
            <p className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm font-medium text-destructive">
              {state.error}
            </p>
          ) : null}
        </CardContent>

        <CardFooter className="flex flex-col gap-5 border-t border-black/10 bg-[#171a1c] px-6 py-6 text-white sm:flex-row sm:items-center sm:justify-between sm:px-9">
          <p className="text-sm leading-6 text-muted-foreground">
            {SETUP_COPY.footerDescription}
          </p>
          <Button
            type="submit"
            className="h-12 w-full justify-between rounded-full bg-[#d7ff66] px-6 text-[#171a1c] hover:bg-[#c9f052] sm:w-56"
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
