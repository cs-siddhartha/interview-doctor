"use client";

import { startTransition, useState } from "react";
import {
  IconCheck,
  IconFileText,
  IconFileUpload,
  IconLoader2,
} from "@tabler/icons-react";

import { uploadResumeFromSetup } from "@/app/actions/sessions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RESUME_SETUP_FIELDS, SETUP_COPY } from "@/constants/setup";
import { type ResumeDocument } from "@/lib/schemas/session";

type ResumeUploadFieldProps = {
  onStateChange: (documentId: string, isUploading: boolean) => void;
};

export function ResumeUploadField({ onStateChange }: ResumeUploadFieldProps) {
  const [document, setDocument] = useState<ResumeDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setDocument(null);
    setError(null);
    onStateChange("", Boolean(file));

    if (!file) {
      setIsUploading(false);
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.set(RESUME_SETUP_FIELDS.file.name, file);

    startTransition(async () => {
      const result = await uploadResumeFromSetup(formData);
      setDocument(result.document);
      setError(result.error);
      setIsUploading(false);
      onStateChange(result.document?.id ?? "", false);
    });
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={RESUME_SETUP_FIELDS.file.name}>
        {RESUME_SETUP_FIELDS.file.label}
      </Label>
      <div className="grid min-h-44 place-items-center gap-3 rounded-sm border border-dashed border-black/20 bg-[#f7f5ef] px-4 py-7 text-center">
        {isUploading ? (
          <IconLoader2 className="size-8 animate-spin text-muted-foreground" />
        ) : document ? (
          <IconCheck className="size-8 text-emerald-700" />
        ) : (
          <IconFileUpload className="size-8 text-muted-foreground" />
        )}
        <div className="grid gap-1">
          <span className="text-sm font-medium">
            {isUploading
              ? SETUP_COPY.resumeUploadingLabel
              : document
                ? SETUP_COPY.resumeReadyLabel
                : RESUME_SETUP_FIELDS.file.uploadTitle}
          </span>
          <span className="text-xs text-black/50">
            {document
              ? `${document.page_count} pages · ${document.chunk_count} sections`
              : RESUME_SETUP_FIELDS.file.uploadDescription}
          </span>
        </div>
        {document ? (
          <span className="flex items-center gap-2 text-xs text-black/60">
            <IconFileText className="size-4" />
            {document.filename}
          </span>
        ) : null}
        <Input
          id={RESUME_SETUP_FIELDS.file.name}
          type="file"
          name={RESUME_SETUP_FIELDS.file.name}
          accept={RESUME_SETUP_FIELDS.file.accept}
          required
          disabled={isUploading}
          onChange={handleFileChange}
          className="h-11 w-full max-w-sm rounded-sm bg-white"
        />
        {error ? (
          <p className="text-sm font-medium text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
