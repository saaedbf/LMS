"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));

const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

/** ساعت جاری سیستم به فرمت HH:mm */
export function getNowHHmm(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export default function TimePicker({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  className = "",
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // sync با value بیرونی
  useEffect(() => {
    setDraft(value || "");
  }, [value]);

  // بستن با کلیک بیرون
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
      return () =>
        document.removeEventListener("mousedown", handleOutsideClick);
    }
  }, [open]);

  const parsedTime = isValidTime(draft)
    ? draft.split(":")
    : isValidTime(value)
      ? value.split(":")
      : ["00", "00"];

  const selectedHour = parsedTime[0];
  const selectedMinute = parsedTime[1];

  const updateTime = (hour: string, minute: string) => {
    const newValue = `${hour}:${minute}`;
    setDraft(newValue);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // فقط رقم و :
    let raw = e.target.value.replace(/[^\d:]/g, "");

    // اگر کاربر بدون : تایپ کرد، بعد از ۲ رقم خودکار : بذار
    if (raw.length === 2 && !raw.includes(":") && draft.length < 2) {
      raw = raw + ":";
    }

    raw = raw.slice(0, 5);
    setDraft(raw);

    if (isValidTime(raw)) {
      onChange(raw);
    }
  };

  const handleBlur = () => {
    // اگر نامعتبره، برگردون به مقدار قبلی
    if (!isValidTime(draft)) {
      setDraft(value || "");
    } else if (draft !== value) {
      onChange(draft);
    }
  };

  const handleToggle = () => {
    if (disabled) return;
    setOpen((prev) => !prev);
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {label}
          {required && <span className="text-rose-500"> *</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          dir="ltr"
          value={draft}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onClick={handleToggle}
          placeholder="HH:mm"
          maxLength={5}
          pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
          required={required}
          disabled={disabled}
          className="w-full cursor-pointer rounded-lg border border-zinc-300 bg-white py-2 pl-3 pr-10 text-center text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:ring-blue-900"
        />

        <button
          type="button"
          disabled={disabled}
          onClick={handleToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-blue-600 disabled:opacity-50"
          aria-label="انتخاب ساعت"
        >
          <Clock size={17} />
        </button>
      </div>

      {open && !disabled && (
        <div className="absolute left-0 top-full z-[100] mt-2 w-[300px] max-w-[calc(100vw-32px)] rounded-xl border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
          {/* پیش‌نمایش بزرگ */}
          <div
            dir="ltr"
            className="mb-3 rounded-lg bg-zinc-50 py-2 text-center text-2xl font-bold tabular-nums text-blue-600 dark:bg-zinc-800 dark:text-blue-400"
          >
            {selectedHour}:{selectedMinute}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* ساعت */}
            <div>
              <div className="mb-2 text-center text-xs font-medium text-zinc-500">
                ساعت
              </div>
              <div className="grid max-h-44 grid-cols-4 gap-1 overflow-y-auto">
                {HOURS.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => updateTime(hour, selectedMinute)}
                    className={`rounded-md py-1.5 text-xs font-medium tabular-nums transition ${
                      selectedHour === hour
                        ? "bg-blue-600 text-white"
                        : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>

            {/* دقیقه — همه‌ی ۶۰ تا */}
            <div>
              <div className="mb-2 text-center text-xs font-medium text-zinc-500">
                دقیقه
              </div>
              <div className="grid max-h-44 grid-cols-4 gap-1 overflow-y-auto">
                {MINUTES.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => updateTime(selectedHour, minute)}
                    className={`rounded-md py-1.5 text-xs font-medium tabular-nums transition ${
                      selectedMinute === minute
                        ? "bg-blue-600 text-white"
                        : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {minute}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                const now = getNowHHmm();
                const [h, m] = now.split(":");
                updateTime(h, m);
              }}
              className="flex-1 rounded-lg border border-zinc-300 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              الان
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg bg-blue-600 py-2 text-xs font-medium text-white hover:bg-blue-700"
            >
              تأیید
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
