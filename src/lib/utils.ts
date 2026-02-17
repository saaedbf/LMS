import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { $ZodIssue } from "zod/v4/core";
export function handleFormServerErrors<TFieldValues extends FieldValues>(
  errorResponse: { status: "error"; error: string | $ZodIssue[] },
  setError: UseFormSetError<TFieldValues>,
) {
  if (Array.isArray(errorResponse.error)) {
    errorResponse.error.forEach((e) => {
      const fildName = e.path.join(".") as Path<TFieldValues>;
      setError(fildName, { message: e.message });
    });
  } else setError("root.serverError", { message: errorResponse.error });
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
