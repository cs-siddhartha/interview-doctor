import { IconStethoscope } from "@tabler/icons-react";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f3f0e8] px-5 text-[#171a1c]">
      <section className="w-full max-w-sm border-y border-black/15 py-8">
        <IconStethoscope className="size-9" aria-hidden="true" />
        <h1 className="mt-5 text-3xl font-semibold">Interview Doctor</h1>
        <p className="mt-2 text-sm leading-6 text-black/55">
          Enter the private access passphrase for this installation.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
