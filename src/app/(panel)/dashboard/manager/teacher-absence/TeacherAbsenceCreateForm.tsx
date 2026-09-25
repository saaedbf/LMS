"use client";

import { useState, useEffect, useTransition, useMemo, useRef } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import {
  createTeacherAbsencesAction,
  getTeachersForAbsence,
  TeacherOption,
} from "@/actions/teacherAbsenceActions";
import { convertJalaliToGregorian } from "@/lib/dateUtils";
import { Clock, CalendarDays, User } from "lucide-react";

interface Props {
  onCreated?: () => void;
  setOpen?: (open: boolean) => void;
}

export function TeacherAbsenceCreateForm({ onCreated, setOpen }: Props) {
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [date, setDate] = useState<Date>(new Date());
  const [isFullDay, setIsFullDay] = useState(false);
  const [startTime, setStartTime] = useState("07:30");
  const [endTime, setEndTime] = useState("09:00");
  const [reason, setReason] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  // بارگذاری معلمان
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const res = await getTeachersForAbsence();
      if (res.status === "success" && res.data) {
        setTeachers(res.data);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  // بستن دراپ‌داون
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTeachers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter(
      (t) => t.fullName.toLowerCase().includes(q) || t.nationalCode.includes(q),
    );
  }, [teachers, searchQuery]);

  const selectedTeachersList = useMemo(() => {
    const map = new Map(teachers.map((t) => [t.teacherId, t]));
    return selectedTeacherIds
      .map((id) => map.get(id))
      .filter(Boolean) as TeacherOption[];
  }, [teachers, selectedTeacherIds]);

  const toggleTeacher = (id: string) => {
    setSelectedTeacherIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const removeTeacher = (id: string) => {
    setSelectedTeacherIds((prev) => prev.filter((i) => i !== id));
  };

  const handleSelectAllFiltered = () => {
    const ids = filteredTeachers.map((t) => t.teacherId);
    const allSelected = ids.every((id) => selectedTeacherIds.includes(id));
    if (allSelected) {
      setSelectedTeacherIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedTeacherIds((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const resetForm = () => {
    setSelectedTeacherIds([]);
    setSearchQuery("");
    setDate(new Date());
    setIsFullDay(false);
    setStartTime("07:30");
    setEndTime("09:00");
    setReason("");
    setMessage(null);
  };

  const handleCancel = () => {
    resetForm();
    setOpen?.(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTeacherIds.length === 0) {
      setMessage({ type: "error", text: "حداقل یک معلم را انتخاب کنید." });
      return;
    }

    if (!isFullDay) {
      if (!startTime || !endTime) {
        setMessage({ type: "error", text: "ساعت شروع و پایان الزامی است." });
        return;
      }
      if (endTime <= startTime) {
        setMessage({
          type: "error",
          text: "ساعت پایان باید بعد از شروع باشد.",
        });
        return;
      }
    }

    setMessage(null);
    startTransition(async () => {
      const gregorianDate = convertJalaliToGregorian(date);
      const res = await createTeacherAbsencesAction({
        teacherIds: selectedTeacherIds,
        date: gregorianDate.toISOString(),
        isFullDay,
        startTime: isFullDay ? undefined : startTime,
        endTime: isFullDay ? undefined : endTime,
        reason: reason || undefined,
      });

      if (res.status === "error") {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({
          type: "success",
          text: `غیبت ثبت شد (${res.data?.created} جدید، ${res.data?.skipped} تکراری).`,
        });
        resetForm();
        onCreated?.();
        setTimeout(() => setOpen?.(false), 1500);
      }
    });
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-100">
          ثبت غیبت معلمان
        </h2>
        <span className="text-xs text-zinc-500">
          انتخاب‌شده:{" "}
          <strong className="text-blue-600">{selectedTeacherIds.length}</strong>{" "}
          نفر
        </span>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-lg p-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* تاریخ و نوع */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              تاریخ غیبت (شمسی)
            </label>
            <DatePicker
              value={date}
              onChange={(d: any) => {
                if (d) setDate(d.toDate ? d.toDate() : new Date(d));
              }}
              calendar={persian}
              locale={persian_fa}
              calendarPosition="bottom-right"
              format="YYYY/MM/DD"
              containerClassName="w-full"
              inputClass="w-full rounded-lg border border-zinc-300 p-2 text-sm text-right dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              placeholder="انتخاب تاریخ شمسی..."
              editable={false}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              نوع غیبت
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFullDay(false)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-2 text-xs font-medium transition ${
                  !isFullDay
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-950/30 dark:text-blue-300"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400"
                }`}
              >
                <Clock size={14} />
                ساعتی
              </button>
              <button
                type="button"
                onClick={() => setIsFullDay(true)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-2 text-xs font-medium transition ${
                  isFullDay
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400"
                }`}
              >
                <CalendarDays size={14} />
                روز کامل
              </button>
            </div>
          </div>
        </div>

        {!isFullDay && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                از ساعت
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 py-2 text-sm text-center dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                تا ساعت
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 py-2 text-sm text-center dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* دلیل */}
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            علت / توضیحات (اختیاری)
          </label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="مثلاً: مرخصی استحقاقی"
            className="w-full rounded-lg border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>

        {/* انتخاب معلمان */}
        <div className="relative space-y-2" ref={dropdownRef}>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              جستجو و انتخاب معلمان
            </label>
            {selectedTeacherIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedTeacherIds([])}
                className="text-xs text-rose-500 hover:underline"
              >
                پاک کردن همه ({selectedTeacherIds.length})
              </button>
            )}
          </div>

          <div
            onClick={() => setIsDropdownOpen(true)}
            className="flex min-h-[42px] cursor-text flex-wrap items-center gap-1.5 rounded-lg border border-zinc-300 bg-white p-1.5 dark:border-zinc-700 dark:bg-zinc-800"
          >
            {selectedTeachersList.map((t) => (
              <span
                key={t.teacherId}
                className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
              >
                <User size={10} />
                <span>{t.fullName}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTeacher(t.teacherId);
                  }}
                  className="mr-0.5 rounded p-0.5 hover:bg-emerald-200 dark:hover:bg-emerald-900"
                >
                  ✕
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder={
                selectedTeachersList.length === 0
                  ? "نام یا کد ملی معلم را جستجو کنید..."
                  : "جستجوی بیشتر..."
              }
              value={searchQuery}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              className="min-w-[140px] flex-1 bg-transparent px-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
            />
          </div>

          {isDropdownOpen && (
            <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
              <div className="mb-2 flex items-center justify-between border-b border-zinc-100 px-1 pb-1.5 dark:border-zinc-800">
                <span className="text-xs text-zinc-500">
                  {isLoading
                    ? "در حال بارگذاری..."
                    : `${filteredTeachers.length} معلم یافت شد`}
                </span>
                {filteredTeachers.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    انتخاب / لغو همه
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="py-6 text-center text-xs text-zinc-400">
                  در حال بارگذاری...
                </div>
              ) : filteredTeachers.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-400">
                  معلمی یافت نشد.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredTeachers.map((t) => {
                    const isSelected = selectedTeacherIds.includes(t.teacherId);
                    return (
                      <div
                        key={t.teacherId}
                        onClick={() => toggleTeacher(t.teacherId)}
                        className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-xs transition-colors ${
                          isSelected
                            ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                            : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-zinc-300 text-emerald-600"
                          />
                          <span className="font-medium">{t.fullName}</span>
                        </div>
                        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          {t.nationalCode}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={isPending || selectedTeacherIds.length === 0}
            className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white shadow hover:bg-emerald-700 disabled:opacity-50"
          >
            {isPending
              ? "در حال ثبت..."
              : `ثبت غیبت برای ${selectedTeacherIds.length} معلم`}
          </button>
        </div>
      </form>
    </div>
  );
}
