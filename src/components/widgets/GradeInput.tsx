"use client";

import { useEffect, useRef } from "react";

type Props = {
  value: any;
  onChange: (val: any) => void;
  gradingType: "NUMERIC" | "DESCRIPTIVE";
  isTest?: boolean;
  hasNegativeScore?: boolean;
  questionCount?: number;
  isSaving?: boolean;
  isSaved?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
};

export default function GradeInput({
  value,
  onChange,
  gradingType,
  isTest = false,
  hasNegativeScore = false,
  questionCount = 1,
  isSaving,
  isSaved,
  inputRef,
}: Props) {
  const localRef = useRef<HTMLInputElement>(null);
  const ref = inputRef || localRef;

  // جلوگیری از تغییر مقدار با اسکرول
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleWheel = () => el.blur();
    el.addEventListener("wheel", handleWheel, { passive: true });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [ref]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    const allInputs = Array.from(
      document.querySelectorAll("[data-grade-input]"),
    ) as HTMLElement[];

    const currentIndex = allInputs.indexOf(target);

    const focusAndSelect = (el: HTMLElement) => {
      el.focus();
      if (el instanceof HTMLInputElement) el.select();
    };

    if (e.key === "Enter" || e.key === "Tab") {
      if (e.key === "Tab" && e.shiftKey) {
        e.preventDefault();
        if (currentIndex > 0) focusAndSelect(allInputs[currentIndex - 1]);
      } else {
        e.preventDefault();
        if (currentIndex < allInputs.length - 1)
          focusAndSelect(allInputs[currentIndex + 1]);
      }
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      if (e.key === "ArrowUp" && currentIndex > 0)
        focusAndSelect(allInputs[currentIndex - 1]);
      else if (e.key === "ArrowDown" && currentIndex < allInputs.length - 1)
        focusAndSelect(allInputs[currentIndex + 1]);
    }
  };

  // ⬅️ حالت تستی
  if (isTest) {
    const correct = Number(value?.correctCount) || 0;
    const wrong = Number(value?.wrongCount) || 0;
    const blank = Number(value?.blankCount) || 0;

    // محاسبه درصد و نمره ۲۰
    let rawScore = correct;
    if (hasNegativeScore) {
      rawScore = correct - wrong / 3;
    }

    const percentage =
      questionCount > 0 ? Math.max(0, (rawScore / questionCount) * 100) : 0;
    const score20 = (percentage / 100) * 20;

    const update = (field: string, val: number) => {
      onChange({ ...value, [field]: val });
    };

    return (
      <div className="flex flex-wrap items-center justify-end gap-2" dir="rtl">
        {/* ۳ ورودی برای تستی */}
        <div className="flex gap-1">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-emerald-600 mb-1">صحیح</span>
            <input
              ref={ref as any}
              type="number"
              data-grade-input
              min={0}
              max={questionCount}
              value={correct || ""}
              onChange={(e) => update("correctCount", Number(e.target.value))}
              onKeyDown={handleKeyDown}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              className="h-10 w-12 rounded-lg border-2 border-emerald-200 bg-emerald-50 text-center font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-rose-600 mb-1">اشتباه</span>
            <input
              type="number"
              data-grade-input
              min={0}
              max={questionCount}
              value={wrong || ""}
              onChange={(e) => update("wrongCount", Number(e.target.value))}
              onKeyDown={handleKeyDown}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              className="h-10 w-12 rounded-lg border-2 border-rose-200 bg-rose-50 text-center font-bold text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-zinc-500 mb-1">بی‌پاسخ</span>
            <input
              type="number"
              data-grade-input
              min={0}
              max={questionCount}
              value={blank || ""}
              onChange={(e) => update("blankCount", Number(e.target.value))}
              onKeyDown={handleKeyDown}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              className="h-10 w-12 rounded-lg border-2 border-zinc-200 bg-zinc-50 text-center font-bold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>
        </div>

        {/* خروجی‌های محاسبه‌شده (ReadOnly) */}
        <div className="flex gap-1 border-r border-zinc-200 pr-2 ml-2">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-blue-600 mb-1">درصد</span>
            <div className="flex h-10 w-16 items-center justify-center rounded-lg border-2 border-blue-200 bg-blue-50 font-bold text-blue-700">
              {percentage.toFixed(1)}%
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-indigo-600 mb-1">نمره (20)</span>
            <div className="flex h-10 w-16 items-center justify-center rounded-lg border-2 border-indigo-200 bg-indigo-50 font-bold text-indigo-700">
              {score20.toFixed(2)}
            </div>
          </div>
        </div>

        {/* نشانگر ذخیره */}
        {(isSaving || isSaved) && (
          <div className="absolute -right-1 -top-1">
            {isSaving ? (
              <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            ) : (
              <span className="block text-emerald-500">✓</span>
            )}
          </div>
        )}
      </div>
    );
  }

  // ⬅️ حالت توصیفی
  if (gradingType !== "NUMERIC") {
    return (
      <select
        ref={ref as any}
        data-grade-input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-11 rounded-lg border-2 border-zinc-300 bg-white px-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">-</option>
        <option value="خیلی خوب">خیلی خوب</option>
        <option value="خوب">خوب</option>
        <option value="قابل قبول">قابل قبول</option>
        <option value="نیاز به تلاش">نیاز به تلاش</option>
      </select>
    );
  }

  // ⬅️ حالت عادی (عددی)
  return (
    <div className="relative">
      <input
        ref={ref as any}
        type="number"
        data-grade-input
        min={0}
        max={20}
        step={0.25}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onWheel={(e) => (e.target as HTMLInputElement).blur()}
        className={`h-11 w-20 rounded-lg border-2 px-2 text-center text-base font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          value !== "" && Number(value) >= 10
            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
            : value !== "" && Number(value) < 10
              ? "border-rose-300 bg-rose-50 text-rose-700"
              : "border-zinc-300 bg-white text-zinc-700"
        }`}
        placeholder="-"
      />
      {(isSaving || isSaved) && (
        <div className="absolute -right-1 -top-1">
          {isSaving ? (
            <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          ) : (
            <span className="block text-emerald-500">✓</span>
          )}
        </div>
      )}
    </div>
  );
}
