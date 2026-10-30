"use client";

import { useState, useEffect, useTransition, useMemo, useRef } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { createEncouragementAction } from "@/actions/encouragementActions";
import {
  getStudentsForDisiplinary,
  StudentOption,
} from "@/actions/disciplinaryActions"; // استفاده مجدد از اکشن انضباطی برای لیست دانش آموزان
import { convertJalaliToGregorian } from "@/lib/dateUtils";

interface Props {
  payes: { id: number; title: string }[];
  klasses: { id: string; title: string; payeId: number }[];
  onCreated?: () => void;
  setOpen?: (open: boolean) => void;
}

export function EncouragementCreateForm({
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
  const [encouragementType, setEncouragementType] =
    useState<string>("EDUCATIONAL"); // ⬅️ استیت نوع

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<string>("07:30");

  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredKlasses = selectedPaye
    ? klasses.filter((k) => k.payeId === selectedPaye)
    : klasses;

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

  useEffect(() => {
    async function loadStudents() {
      setIsLoadingStudents(true);
      const res = await getStudentsForDisiplinary({
        payeId: selectedPaye,
        klassId: selectedKlass,
      });
      if (res.status === "success" && res.data) setStudents(res.data);
      setIsLoadingStudents(false);
    }
    loadStudents();
  }, [selectedPaye, selectedKlass]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.klassTitle.toLowerCase().includes(q),
    );
  }, [students, searchQuery]);

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

  // ⬅️ ریست فرم (به همراه ریست نوع)
  const resetForm = () => {
    setSelectedPaye(undefined);
    setSelectedKlass(undefined);
    setSelectedEnrollmentIds([]);
    setSearchQuery("");
    setDate(new Date());
    setStartTime("07:30");
    setEncouragementType("EDUCATIONAL"); // ریست نوع
    setMessage(null);
  };

  const handleCancel = () => {
    resetForm();
    if (setOpen) setOpen(false);
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

      const res = await createEncouragementAction({
        enrollmentIds: selectedEnrollmentIds,
        date: gregorianDate.toISOString(),
        startTime,
        reason,
        type: encouragementType, // ⬅️ ارسال نوع
      });

      if (res.status === "error") {
        setMessage({ type: "error", text: res.error.toString() });
      } else {
        setMessage({
          type: "success",
          text: `تشویق با موفقیت ثبت شد (${res.data?.created} مورد جدید، ${res.data?.skipped} مورد تکراری).`,
        });
        setSelectedEnrollmentIds([]);
        resetForm();
        onCreated?.();
        if (setOpen) setTimeout(() => setOpen(false), 1500);
      }
    });
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-100">
          ثبت تشویق جدید
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
          className={`mb-4 rounded-lg p-3 text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {" "}
          {/* ⬅️ تغییر به 5 ستون */}
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              محدوده پایه
            </label>
            <select
              value={selectedPaye || ""}
              onChange={(e) => {
                setSelectedPaye(
                  e.target.value ? Number(e.target.value) : undefined,
                );
                setSelectedKlass(undefined);
              }}
              className="w-full rounded-lg border border-zinc-300 p-2 text-sm"
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
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              محدوده کلاس
            </label>
            <select
              value={selectedKlass || ""}
              onChange={(e) => setSelectedKlass(e.target.value || undefined)}
              className="w-full rounded-lg border border-zinc-300 p-2 text-sm"
            >
              <option value="">تمام کلاس‌ها</option>
              {filteredKlasses.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.title}
                </option>
              ))}
            </select>
          </div>
          {/* ⬅️ فیلد نوع تشویق */}
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              نوع تشویق
            </label>
            <select
              value={encouragementType}
              onChange={(e) => setEncouragementType(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 p-2 text-sm"
            >
              <option value="EDUCATIONAL">آموزشی</option>
              <option value="CULTURAL">پرورشی</option>
              <option value="DISCIPLINARY">انضباطی</option>
              <option value="COMPETITIONS">مسابقات</option>
              <option value="KHAVARAZMI">جشنواره خوارزمی</option>
              <option value="OTHER">سایر</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              تاریخ (شمسی)
            </label>
            <DatePicker
              value={date}
              onChange={(d: any) =>
                d && setDate(d.toDate ? d.toDate() : new Date(d))
              }
              calendar={persian}
              locale={persian_fa}
              format="YYYY/MM/DD"
              editable={false}
              containerClassName="w-full"
              inputClass="w-full rounded-lg border border-zinc-300 p-2 text-sm text-right"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              ساعت
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 py-2 text-sm text-center"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block font-medium text-zinc-700">
            توضیحات / دلیل
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="مورد تشویق"
            className="w-full rounded-lg border border-zinc-300 p-2 text-sm"
          />
        </div>

        <div className="relative space-y-2" ref={dropdownRef}>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-zinc-700">
              جستجو و انتخاب دانش‌آموزان
            </label>
            {selectedEnrollmentIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedEnrollmentIds([])}
                className="text-xs text-rose-500 hover:underline"
              >
                پاک کردن همه
              </button>
            )}
          </div>

          <div
            onClick={() => setIsDropdownOpen(true)}
            className="flex min-h-[42px] cursor-text flex-wrap items-center gap-1.5 rounded-lg border border-zinc-300 bg-white p-1.5"
          >
            {selectedStudentsList.map((st) => (
              <span
                key={st.enrollmentId}
                className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
              >
                <span>{st.fullName}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeStudent(st.enrollmentId);
                  }}
                  className="mr-0.5 rounded p-0.5 hover:bg-blue-200"
                >
                  ✕
                </button>
              </span>
            ))}
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              placeholder="جستجو..."
              className="min-w-[140px] flex-1 bg-transparent px-2 text-sm focus:outline-none"
            />
          </div>

          {isDropdownOpen && (
            <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white p-2 shadow-lg">
              <div className="mb-2 flex items-center justify-between border-b pb-1.5">
                <span className="text-xs text-zinc-500">
                  {isLoadingStudents
                    ? "در حال بارگذاری..."
                    : `${filteredStudents.length} دانش‌آموز`}
                </span>
                {filteredStudents.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    انتخاب همه
                  </button>
                )}
              </div>
              {filteredStudents.map((st) => {
                const isSelected = selectedEnrollmentIds.includes(
                  st.enrollmentId,
                );
                return (
                  <div
                    key={st.enrollmentId}
                    onClick={() => toggleStudent(st.enrollmentId)}
                    className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-xs ${isSelected ? "bg-blue-50" : "hover:bg-zinc-100"}`}
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
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px]">
                      {st.klassTitle}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border px-6 py-2.5 text-sm"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={isPending || selectedEnrollmentIds.length === 0}
            className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {isPending
              ? "در حال ثبت..."
              : `ثبت تشویق برای ${selectedEnrollmentIds.length} نفر`}
          </button>
        </div>
      </form>
    </div>
  );
}
