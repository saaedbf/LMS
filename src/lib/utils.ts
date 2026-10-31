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
export function getNowHHmm(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}
export function getNowPlusHour(): string {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}
export function toJalaliMonthKey(date: Date): { key: string; label: string } {
  // تبدیل دقیق تاریخ میلادی به شمسی
  const faDate = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);

  // خروجی معمولاً به شکل 1405/7/15 است
  const parts = faDate.split("/");
  const year = parts[0];
  const monthNum = Number(parts[1]); // مثلا 7

  const monthNames = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ];

  const monthLabel = monthNames[monthNum - 1] || parts[1]; // اگر عدد پیدا نشد، خود عدد را بگذارد

  return {
    key: `${year}/${String(monthNum).padStart(2, "0")}`,
    label: `${monthLabel} ${year}`, // مثلا: مهر 1405
  };
}
