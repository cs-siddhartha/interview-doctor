import { IconCode, IconFileUpload } from "@tabler/icons-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DSA_MODE,
  RESUME_MODE,
} from "@/constants/interview-modes";
import {
  DOMAIN_SETUP_FIELDS,
  DSA_SETUP_FIELDS,
  RESUME_SETUP_FIELDS,
  SETUP_COPY,
} from "@/constants/setup";
import { type InterviewMode } from "@/lib/interview-options";

import { SelectInput, TextInput } from "./form-controls";

type SetupFieldsProps = {
  mode: InterviewMode["mode"];
};

export function SetupFields({ mode }: SetupFieldsProps) {
  return (
    <section className="grid gap-5">
      <div className="grid gap-2 sm:grid-cols-[3rem_1fr]">
        <span className="font-mono text-xs font-semibold text-black/40">02</span>
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">
            {SETUP_COPY.focusTitle}
          </h2>
          <p className="mt-1 text-sm leading-6 text-black/50">
            {SETUP_COPY.focusDescription}
          </p>
        </div>
      </div>
      {mode === RESUME_MODE.id ? <ResumeSetupFields /> : null}
      {mode === DSA_MODE.id ? <DsaSetupFields /> : null}
      {mode !== RESUME_MODE.id && mode !== DSA_MODE.id ? (
        <DomainSetupFields />
      ) : null}
    </section>
  );
}

function ResumeSetupFields() {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor={RESUME_SETUP_FIELDS.file.name}>
          {RESUME_SETUP_FIELDS.file.label}
        </Label>
        <span className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-black/20 bg-[#f7f5ef] px-4 py-7 text-center">
          <IconFileUpload className="size-8 text-muted-foreground" />
          <span className="grid gap-1">
            <span className="text-sm font-medium">
              {RESUME_SETUP_FIELDS.file.uploadTitle}
            </span>
            <span className="text-sm text-muted-foreground">
              {RESUME_SETUP_FIELDS.file.uploadDescription}
            </span>
          </span>
          <Input
            id={RESUME_SETUP_FIELDS.file.name}
            type="file"
            name={RESUME_SETUP_FIELDS.file.name}
            accept={RESUME_SETUP_FIELDS.file.accept}
            className="h-11 w-full max-w-sm rounded-xl bg-white"
          />
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label={RESUME_SETUP_FIELDS.targetRole.label}
          name={RESUME_SETUP_FIELDS.targetRole.name}
          placeholder={RESUME_SETUP_FIELDS.targetRole.placeholder}
        />
        <SelectInput
          label={RESUME_SETUP_FIELDS.intensity.label}
          name={RESUME_SETUP_FIELDS.intensity.name}
          options={[...RESUME_SETUP_FIELDS.intensity.options]}
        />
      </div>
    </>
  );
}

function DomainSetupFields() {
  return (
    <div className="grid gap-4">
      <TextInput
        label={DOMAIN_SETUP_FIELDS.topic.label}
        name={DOMAIN_SETUP_FIELDS.topic.name}
        placeholder={DOMAIN_SETUP_FIELDS.topic.placeholder}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectInput
          label={DOMAIN_SETUP_FIELDS.seniority.label}
          name={DOMAIN_SETUP_FIELDS.seniority.name}
          options={[...DOMAIN_SETUP_FIELDS.seniority.options]}
        />
        <SelectInput
          label={DOMAIN_SETUP_FIELDS.style.label}
          name={DOMAIN_SETUP_FIELDS.style.name}
          options={[...DOMAIN_SETUP_FIELDS.style.options]}
        />
      </div>
    </div>
  );
}

function DsaSetupFields() {
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2 rounded-xl bg-[#171a1c] p-4 text-sm text-white/65">
        <IconCode className="size-4" aria-hidden="true" />
        {DSA_SETUP_FIELDS.editorNotice}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectInput
          label={DSA_SETUP_FIELDS.topic.label}
          name={DSA_SETUP_FIELDS.topic.name}
          options={[...DSA_SETUP_FIELDS.topic.options]}
        />
        <SelectInput
          label={DSA_SETUP_FIELDS.difficulty.label}
          name={DSA_SETUP_FIELDS.difficulty.name}
          options={[...DSA_SETUP_FIELDS.difficulty.options]}
        />
      </div>
      <TextInput
        label={DSA_SETUP_FIELDS.language.label}
        name={DSA_SETUP_FIELDS.language.name}
        placeholder={DSA_SETUP_FIELDS.language.placeholder}
      />
    </div>
  );
}
