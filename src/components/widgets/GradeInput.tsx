"use client";

import { useEffect, useRef } from "react";

type Props = {
  value: any;
  onChange: (val: any) => void;
  gradingType: "NUMERIC" | "DESCRIPTIVE";
  isSaving?: boolean;
  isSaved?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
};

export default function GradeInput({
  value,
  onChange,
  gradingType,
  isSaving,
  isSaved,
  inputRef,
}: Props) {
  const localRef = useRef<HTMLInputElement>(null);
  const ref = inputRef || localRef;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleWheel = () => {
      el.blur();
    };

    el.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [ref]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const target = e.target as HTMLElement;
    const isSelect = target.tagName === "SELECT";

    if (gradingType !== "NUMERIC" && !isSelect) return;

    const allInputs = Array.from(
      document.querySelectorAll("[data-grade-input]"),
    ) as (HTMLInputElement | HTMLSelectElement)[];

    const currentIndex = allInputs.indexOf(
      target as HTMLInputElement | HTMLSelectElement,
    );

    // ⬅️ تابع کمکی برای فوکوس و انتخاب
    const focusAndSelect = (el: HTMLInputElement | HTMLSelectElement) => {
      el.focus();
      // انتخاب متن فقط برای input مجاز است
      if (el instanceof HTMLInputElement) {
        el.select();
      }
    };

    if (e.key === "Enter" || e.key === "Tab") {
      if (e.key === "Tab" && e.shiftKey) {
        e.preventDefault();
        if (currentIndex > 0) {
          focusAndSelect(allInputs[currentIndex - 1]);
        }
      } else {
        e.preventDefault();
        if (currentIndex < allInputs.length - 1) {
          focusAndSelect(allInputs[currentIndex + 1]);
        }
      }
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      if (isSelect) return;

      e.preventDefault();

      if (e.key === "ArrowUp" && currentIndex > 0) {
        focusAndSelect(allInputs[currentIndex - 1]);
      } else if (e.key === "ArrowDown" && currentIndex < allInputs.length - 1) {
        focusAndSelect(allInputs[currentIndex + 1]);
      }
    }
  };

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
