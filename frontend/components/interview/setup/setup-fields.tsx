import { IconCode, IconFileUpload } from "@tabler/icons-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type InterviewMode } from "@/lib/interview-options";

import { SelectInput, TextInput } from "./form-controls";

type SetupFieldsProps = {
  mode: InterviewMode["mode"];
};

export function SetupFields({ mode }: SetupFieldsProps) {
  if (mode === "resume") {
    return <ResumeSetupFields />;
  }

  if (mode === "dsa") {
    return <DsaSetupFields />;
  }

  return <DomainSetupFields />;
}

function ResumeSetupFields() {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="resume">Resume file</Label>
        <span className="flex min-h-36 flex-col items-center justify-center gap-3 border border-dashed border-border bg-background px-4 py-6 text-center">
          <IconFileUpload className="size-8 text-muted-foreground" />
          <span className="grid gap-1">
            <span className="text-sm font-medium">Upload placeholder</span>
            <span className="text-sm text-muted-foreground">
              PDF or DOCX parsing will be added in a later chunk.
            </span>
          </span>
          <Input
            id="resume"
            type="file"
            name="resume"
            accept=".pdf,.doc,.docx"
            className="h-10 w-full max-w-sm rounded-none bg-background"
          />
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label="Target role"
          name="targetRole"
          placeholder="Senior frontend engineer"
        />
        <SelectInput
          label="Grilling intensity"
          name="intensity"
          options={["Balanced", "Strict", "Very strict"]}
        />
      </div>
    </>
  );
}

function DomainSetupFields() {
  return (
    <div className="grid gap-4">
      <TextInput
        label="Interview domain"
        name="domain"
        placeholder="React performance, system design, behavioral..."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectInput
          label="Seniority"
          name="seniority"
          options={["Junior", "Mid-level", "Senior", "Staff"]}
        />
        <SelectInput
          label="Interview style"
          name="style"
          options={["Conversational", "Structured", "Rapid follow-up"]}
        />
      </div>
    </div>
  );
}

function DsaSetupFields() {
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2 border border-border bg-background p-3 text-sm text-muted-foreground">
        <IconCode className="size-4" aria-hidden="true" />
        Code editor and problem bank arrive with the session chunk.
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectInput
          label="Topic"
          name="topic"
          options={["Arrays", "Strings", "Graphs", "Dynamic programming"]}
        />
        <SelectInput
          label="Difficulty"
          name="difficulty"
          options={["Easy", "Medium", "Hard"]}
        />
      </div>
      <TextInput
        label="Preferred language"
        name="language"
        placeholder="TypeScript, Python, Java..."
      />
    </div>
  );
}
