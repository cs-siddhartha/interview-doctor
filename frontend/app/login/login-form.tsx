"use client";

import { useActionState } from "react";
import { IconLock } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { login, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, action, isPending] = useActionState(login, initialState);

  return (
    <form action={action} className="mt-7 space-y-5">
      <div className="space-y-2">
        <Label htmlFor="passphrase">Access passphrase</Label>
        <Input
          id="passphrase"
          name="passphrase"
          type="password"
          autoComplete="current-password"
          required
          maxLength={256}
          autoFocus
        />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={isPending} className="w-full">
        <IconLock aria-hidden="true" />
        {isPending ? "Checking..." : "Unlock Interview Doctor"}
      </Button>
    </form>
  );
}
