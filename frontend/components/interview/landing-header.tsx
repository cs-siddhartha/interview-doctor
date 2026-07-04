import { APP_COPY } from "@/constants/app";

export function LandingHeader() {
  return (
    <header className="border-b border-border pb-8">
      <div className="max-w-4xl">
        <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
          {APP_COPY.headline}
        </h1>
      </div>
    </header>
  );
}
