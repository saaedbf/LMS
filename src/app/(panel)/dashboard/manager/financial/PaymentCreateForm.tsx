"use client";

import { useState, useEffect, useTransition, useMemo, useRef } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import {
  createDebtsAction,
  getStudentsForFinancial,
} from "@/actions/financialActions";
import { convertJalaliToGregorian } from "@/lib/dateUtils";
import { DEBT_TYPE_OPTIONS } from "@/lib/financialLabels";
import { User } from "lucide-react";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/financialLabels";
import { createPaymentsAction } from "@/actions/financialActions";
interface Props {
  payes: { id: number; title: string }[];
  klasses: { id: string; title: string; payeId: number }[];
  onCreated?: () => void;
  setOpen?: (open: boolean) => void;
}

export function PaymentCreateForm({
  payes,
  klasses,
  onCreated,
  setOpen,
}: Props) {
  const [selectedPaye, setSelectedPaye] = useState<number | undefined>();
  const [selectedKlass, setSelectedKlass] = useState<string | undefined>();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<string[]>(
    [],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [date, setDate] = useState<Date>(new Date());
  const [debtType, setDebtType] = useState("TUITION");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
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
      const res = await getStudentsForFinancial({
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
    return selectedEnrollmentIds.map((id) => map.get(id)).filter(Boolean);
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

  const resetForm = () => {
    setSelectedPaye(undefined);
    setSelectedKlass(undefined);
    setSelectedEnrollmentIds([]);
    setSearchQuery("");
    setDate(new Date());
    setDebtType("TUITION");
    setAmount("");
    setDescription("");
    setMessage(null);
  };

  const handleCancel = () => {
    resetForm();
    setOpen?.(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedEnrollmentIds.length === 0) {
      setMessage({ type: "error", text: "حداقل یک دانش‌آموز را انتخاب کنید." });
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setMessage({ type: "error", text: "مبلغ را وارد کنید." });
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const gregorianDate = convertJalaliToGregorian(date);

      const res = await createPaymentsAction({
        enrollmentIds: selectedEnrollmentIds,
        paymentMethod: paymentMethod as any,
        date: gregorianDate.toISOString(),
        amount: Number(amount),
        description: description.trim() || undefined,
      });

      if (res.status === "error") {
        setMessage({ type: "error", text: res.error.toString() });
      } else {
        setMessage({
          type: "success",
          text: `پرداخت  برای ${res.data?.created} دانش‌آموز ثبت شد.`,
        });
        resetForm();
        onCreated?.();
        setTimeout(() => setOpen?.(false), 1500);
      }
    });
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-zinc-800">ثبت پرداخت جدید</h2>
        <span className="text-xs text-zinc-500">
          انتخاب‌شده:{" "}
          <strong className="text-rose-600">
            {selectedEnrollmentIds.length}
          </strong>{" "}
          نفر
        </span>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-lg p-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* نوع بدهکاری + تاریخ + مبلغ */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              نوع پرداخت
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 p-2 text-sm"
            >
              {PAYMENT_METHOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              تاریخ (شمسی)
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
              inputClass="w-full rounded-lg border border-zinc-300 p-2 text-sm text-right"
              placeholder="انتخاب تاریخ..."
              editable={false}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              مبلغ (تومان)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setAmount(val);
              }}
              placeholder="مثلاً 500000"
              className="w-full rounded-lg border border-zinc-300 p-2 text-sm text-left"
              dir="ltr"
            />
            {amount && (
              <p className="mt-1 text-xs text-zinc-500">
                {Number(amount).toLocaleString("fa-IR")} تومان
              </p>
            )}
          </div>
        </div>

        {/* شرح */}
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">
            شرح پرداخت (اختیاری)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="توضیحات..."
            className="w-full rounded-lg border border-zinc-300 p-2 text-sm"
          />
        </div>

        {/* فیلتر پایه و کلاس */}
        <div className="grid grid-cols-2 gap-3">
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
        </div>

        {/* انتخاب دانش‌آموزان */}
        <div className="relative space-y-2" ref={dropdownRef}>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-zinc-700">
              انتخاب دانش‌آموزان
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
            {selectedStudentsList.map((st: any) => (
              <span
                key={st.enrollmentId}
                className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700"
              >
                <span>{st.fullName}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeStudent(st.enrollmentId);
                  }}
                  className="mr-0.5 rounded p-0.5 hover:bg-rose-200"
                >
                  ✕
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder={
                selectedStudentsList.length === 0
                  ? "نام یا کلاس را جستجو کنید..."
                  : "جستجوی بیشتر..."
              }
              value={searchQuery}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              className="min-w-[140px] flex-1 bg-transparent px-2 text-sm focus:outline-none"
            />
          </div>

          {isDropdownOpen && (
            <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white p-2 shadow-lg">
              <div className="mb-2 flex items-center justify-between border-b border-zinc-100 px-1 pb-1.5">
                <span className="text-xs text-zinc-500">
                  {isLoadingStudents
                    ? "در حال بارگذاری..."
                    : `${filteredStudents.length} دانش‌آموز`}
                </span>
                {filteredStudents.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    انتخاب / لغو همه
                  </button>
                )}
              </div>

              {isLoadingStudents ? (
                <div className="py-6 text-center text-xs text-zinc-400">
                  در حال بارگذاری...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-400">
                  دانش‌آموزی یافت نشد.
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
                            ? "bg-rose-50 text-rose-900"
                            : "hover:bg-zinc-100"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-zinc-300 text-rose-600"
                          />
                          <span className="font-medium">{st.fullName}</span>
                        </div>
                        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] text-zinc-600">
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

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={isPending || selectedEnrollmentIds.length === 0}
            className="rounded-lg bg-rose-600 px-6 py-2.5 text-sm font-medium text-white shadow hover:bg-rose-700 disabled:opacity-50"
          >
            {isPending
              ? "در حال ثبت..."
              : `ثبت پرداخت برای ${selectedEnrollmentIds.length} دانش‌آموز`}
          </button>
        </div>
      </form>
    </div>
  );
}
