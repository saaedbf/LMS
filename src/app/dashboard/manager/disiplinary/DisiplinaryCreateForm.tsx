"use client";

import { useState, useEffect, useTransition, useMemo, useRef } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import {
  createDisciplinaryAction,
  deleteDisiplinaryAction,
  getStudentsForDisiplinary,
  StudentOption,
} from "@/actions/disciplinaryActions";
import { convertJalaliToGregorian } from "@/lib/dateUtils";

interface Props {
  payes: { id: number; title: string }[];
  klasses: { id: string; title: string; payeId: number }[];
  onCreated?: () => void;
  setOpen?: (open: boolean) => void; // از ActionModal می‌آید
}

export function DisiplinaryCreateForm({
  payes,
  klasses,
  onCreated,
  setOpen,
}: Props) {
  const [selectedPaye, setSelectedPaye] = useState<number | undefined>();
  const [selectedKlass, setSelectedKlass] = useState<string | undefined>();
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<string[]>(
    [],
  );
  const [reason, setReason] = useState<string>("");
  // مدیریت سرچ چندگانه
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // تاریخ و ساعت پیش‌فرض
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<string>("07:30");

  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  // فیلتر کلاس‌ها بر اساس پایه انتخاب‌شده
  const filteredKlasses = selectedPaye
    ? klasses.filter((k) => k.payeId === selectedPaye)
    : klasses;

  // بستن دراپ‌داون در کلیک به خارج
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // واکشی لیست دانش‌آموزان
  useEffect(() => {
    async function loadStudents() {
      setIsLoadingStudents(true);
      const res = await getStudentsForDisiplinary({
        payeId: selectedPaye,
        klassId: selectedKlass,
      });
      if (res.status === "success" && res.data) {
        setStudents(res.data);
      }
      setIsLoadingStudents(false);
    }
    loadStudents();
  }, [selectedPaye, selectedKlass]);

  // فیلتر زنده روی اسامی دانش‌آموزان
  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.klassTitle.toLowerCase().includes(q),
    );
  }, [students, searchQuery]);

  // نمایش دانش‌آموزان انتخاب‌شده به شکل تگ
  const selectedStudentsList = useMemo(() => {
    const map = new Map(students.map((s) => [s.enrollmentId, s]));
    return selectedEnrollmentIds
      .map((id) => map.get(id))
      .filter(Boolean) as StudentOption[];
  }, [students, selectedEnrollmentIds]);

  const toggleStudent = (id: string) => {
    setSelectedEnrollmentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const removeStudent = (id: string) => {
    setSelectedEnrollmentIds((prev) => prev.filter((item) => item !== id));
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredStudents.map((s) => s.enrollmentId);
    const allSelected = filteredIds.every((id) =>
      selectedEnrollmentIds.includes(id),
    );

    if (allSelected) {
      setSelectedEnrollmentIds((prev) =>
        prev.filter((id) => !filteredIds.includes(id)),
      );
    } else {
      setSelectedEnrollmentIds((prev) =>
        Array.from(new Set([...prev, ...filteredIds])),
      );
    }
  };

  // تابع ریست کردن فرم
  const resetForm = () => {
    setSelectedPaye(undefined);
    setSelectedKlass(undefined);
    setSelectedEnrollmentIds([]);
    setSearchQuery("");
    setDate(new Date());
    setStartTime("07:30");
    setMessage(null);
  };

  // تابع انصراف
  const handleCancel = () => {
    resetForm();
    // بستن مودال
    if (setOpen) {
      setOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEnrollmentIds.length === 0) {
      setMessage({ type: "error", text: "حداقل یک دانش‌آموز را انتخاب کنید." });
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const gregorianDate = convertJalaliToGregorian(date);

      const res = await createDisciplinaryAction({
        enrollmentIds: selectedEnrollmentIds,
        date: gregorianDate.toISOString(),
        startTime,
        reason,
      });

      if (res.status === "error") {
        setMessage({
          type: "error",
          text: res.error.toString() || "خطا در ثبت ",
        });
      } else {
        setMessage({
          type: "success",
          text: `غیبت با موفقیت ثبت شد (${res.data?.created} مورد جدید، ${res.data?.skipped} مورد تکراری نادیده گرفته شد).`,
        });
        setSelectedEnrollmentIds([]);
        resetForm();
        onCreated?.();
        // بستن مودال بعد از ثبت موفق
        if (setOpen) {
          setTimeout(() => setOpen(false), 1500);
        }
      }
    });
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-100">
          ثبت مورد انضباطی جدید
        </h2>
        <span className="text-xs text-zinc-500">
          تعداد انتخاب‌شده:{" "}
          <strong className="text-blue-600">
            {selectedEnrollmentIds.length}
          </strong>{" "}
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
        {/* فیلترها و زمان‌بندی */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              محدوده پایه (اختیاری)
            </label>
            <select
              value={selectedPaye || ""}
              onChange={(e) => {
                setSelectedPaye(
                  e.target.value ? Number(e.target.value) : undefined,
                );
                setSelectedKlass(undefined);
              }}
              className="w-full rounded-lg border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            >
              <option value="">کل مدرسه</option>
              {payes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              محدوده کلاس (اختیاری)
            </label>
            <select
              value={selectedKlass || ""}
              onChange={(e) => setSelectedKlass(e.target.value || undefined)}
              className="w-full rounded-lg border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            >
              <option value="">تمام کلاس‌ها</option>
              {filteredKlasses.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              تاریخ (شمسی)
            </label>
            <DatePicker
              value={date}
              onChange={(selectedDate: any) => {
                if (selectedDate) {
                  if (selectedDate.toDate) {
                    setDate(selectedDate.toDate());
                  } else {
                    setDate(new Date(selectedDate));
                  }
                }
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

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block  text-xs font-medium text-zinc-600 dark:text-zinc-400">
                ساعت
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 py-2  text-sm text-center dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
              توضیحات / دلیل
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مورد بی انضباطی"
              className="w-full rounded-lg border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>
        </div>

        {/* فیلد چندانتخابی جستجوپذیر */}
        <div className="relative space-y-2" ref={dropdownRef}>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              جستجو و انتخاب دانش‌آموزان
            </label>
            {selectedEnrollmentIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedEnrollmentIds([])}
                className="text-xs text-rose-500 hover:underline"
              >
                پاک کردن همه ({selectedEnrollmentIds.length})
              </button>
            )}
          </div>

          {/* ورودی و برچسب‌های انتخاب‌شده */}
          <div
            onClick={() => setIsDropdownOpen(true)}
            className="flex min-h-[42px] cursor-text flex-wrap items-center gap-1.5 rounded-lg border border-zinc-300 bg-white p-1.5 dark:border-zinc-700 dark:bg-zinc-800"
          >
            {selectedStudentsList.map((st) => (
              <span
                key={st.enrollmentId}
                className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
              >
                <span>{st.fullName}</span>
                <span className="text-[10px] opacity-70">
                  ({st.klassTitle})
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeStudent(st.enrollmentId);
                  }}
                  className="mr-0.5 rounded p-0.5 hover:bg-blue-200 dark:hover:bg-blue-900"
                >
                  ✕
                </button>
              </span>
            ))}

            <input
              type="text"
              placeholder={
                selectedStudentsList.length === 0
                  ? "نام، نام خانوادگی یا کلاس را جستجو کنید..."
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

          {/* لیست دراپ‌داون */}
          {isDropdownOpen && (
            <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
              <div className="mb-2 flex items-center justify-between border-b border-zinc-100 px-1 pb-1.5 dark:border-zinc-800">
                <span className="text-xs text-zinc-500">
                  {isLoadingStudents
                    ? "در حال بارگذاری..."
                    : `${filteredStudents.length} دانش‌آموز یافت شد`}
                </span>
                {filteredStudents.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    انتخاب / لغو همه این لیست
                  </button>
                )}
              </div>

              {isLoadingStudents ? (
                <div className="py-6 text-center text-xs text-zinc-400">
                  در حال بارگذاری لیست...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-400">
                  دانش‌آموزی با این مشخصات یافت نشد.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredStudents.map((st) => {
                    const isSelected = selectedEnrollmentIds.includes(
                      st.enrollmentId,
                    );
                    return (
                      <div
                        key={st.enrollmentId}
                        onClick={() => toggleStudent(st.enrollmentId)}
                        className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-xs transition-colors ${
                          isSelected
                            ? "bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200"
                            : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-zinc-300 text-blue-600"
                          />
                          <span className="font-medium">{st.fullName}</span>
                        </div>
                        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          {st.klassTitle}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* دکمه‌های اقدام */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={isPending || selectedEnrollmentIds.length === 0}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isPending
              ? "در حال ثبت..."
              : `ثبت مورد انضباطی برای ${selectedEnrollmentIds.length} دانش‌آموز`}
          </button>
        </div>
      </form>
    </div>
  );
}
