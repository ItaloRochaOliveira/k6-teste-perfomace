"use client";

import { useFormField } from "./form";

export function FormValidationMessage() {
  const { error, formMessageId } = useFormField();

  if (!error?.message) return null;

  return (
    <p id={formMessageId} className="text-destructive text-xs font-medium">
      {String(error.message)}
    </p>
  );
}
