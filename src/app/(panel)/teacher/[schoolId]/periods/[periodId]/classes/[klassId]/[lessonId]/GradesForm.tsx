"use client";

import { useState, useTransition, useMemo } from "react";
import { toast } from "react-toastify";
import { Check, Loader2, Users, BookOpen, Trash2 } from "lucide-react";
import {
  saveGrade,
  getClassStudentsWithGrades,
} from "@/actions/teacherPanelActions";
import BackButton from "@/components/widgets/Elements/BackButton";
import BulkGradesModal from "./BulkGradesModal";

type Student = {
  enrollmentId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  nationalCode: string;
  fullName: string;
  currentValue: number | string;
};

type Props = {
  schoolId: number;
  periodId: string;
  klassId: string;
  lessonId: string;
  lesson: {
    id: string;
    title: string;
    units: number;
  };
  klass: {
    id: string;
    title: string;
    paye: string;
    reshtehTahsili: string;
  };
  students: Student[];
  gradingType: "DESCRIPTIVE" | "NUMERIC";
};

const DESCRIPTIVE_OPTIONS = ["خیلی خوب", "خوب", "قابل قبول", "نیاز به تلاش"];

export default function GradesForm({
  schoolId,
  periodId,
  klassId,
  lessonId,
  lesson,
  klass,
  students,
  gradingType,
}: Props) {
  // ⬅️ استفاده از State محلی برای آپدیت داینامیک لیست
  const [localStudents, setLocalStudents] = useState<Student[]>(students);

  const [values, setValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    for (const s of students) {
      initial[s.enrollmentId] = s.currentValue;
    }
    return initial;
  });

  const [savingCells, setSavingCells] = useState<Set<string>>(new Set());
  const [savedCells, setSavedCells] = useState<Set<string>>(new Set());

  const [isPending, startTransition] = useTransition();

  // ⬅️ تابع رفرش لیست نمرات بعد از ثبت گروهی
  const refreshGrades = async () => {
    const res = await getClassStudentsWithGrades(
      schoolId,
      periodId,
      klassId,
      lessonId,
    );
    if (res.status === "success" && res.data) {
      setLocalStudents(res.data.students);
      const newVals: Record<string, any> = {};
      for (const s of res.data.students) {
        newVals[s.enrollmentId] = s.currentValue;
      }
      setValues(newVals);
    }
  };

  // پیشرفت
  const stats = useMemo(() => {
    let filled = 0;
    for (const s of localStudents) {
      const val = values[s.enrollmentId];
      if (val !== undefined && val !== null && val !== "") {
        filled++;
      }
    }
    return {
      total: localStudents.length,
      filled,
      percent:
        localStudents.length > 0
          ? Math.round((filled / localStudents.length) * 100)
          : 0,
    };
  }, [values, localStudents]);

  const handleChange = (enrollmentId: string, value: any) => {
    if (gradingType === "NUMERIC") {
      if (value !== "" && value !== null && value !== undefined) {
        const num = Number(value);
        if (isNaN(num)) return;
        if (num < 0 || num > 20) {
          toast.error("نمره باید بین ۰ تا ۲۰ باشد");
          return;
        }
      }
    }

    setValues((prev) => ({ ...prev, [enrollmentId]: value }));

    const cellKey = enrollmentId;
    setSavingCells((prev) => new Set(prev).add(cellKey));

    startTransition(async () => {
      try {
        const res = await saveGrade({
          enrollmentId,
          darsPayeReshtehId: lessonId,
          periodId,
          score:
            gradingType === "NUMERIC" && value !== "" && value !== null
              ? Number(value)
              : null,
          descriptiveValue:
            gradingType === "DESCRIPTIVE" && value !== "" ? value : null,
        });

        if (res.status === "error") {
          toast.error(res.error);
        } else {
          setSavedCells((prev) => new Set(prev).add(cellKey));
          setTimeout(() => {
            setSavedCells((prev) => {
              const next = new Set(prev);
              next.delete(cellKey);
              return next;
            });
          }, 1500);
        }
      } catch (error) {
        console.error(error);
        toast.error("خطا در ذخیره نمره");
      } finally {
        setSavingCells((prev) => {
          const next = new Set(prev);
          next.delete(cellKey);
          return next;
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <BackButton
          href={`/teacher/${schoolId}/periods/${periodId}/classes/${klassId}`}
          label="بازگشت به لیست دروس"
        />

        {/* ⬅️ دکمه ثبت گروهی */}
        <BulkGradesModal
          periodId={periodId}
          lessonId={lessonId}
          klassId={klassId}
          gradingType={gradingType}
          onSuccess={refreshGrades}
        />
      </div>

      {/* هدر */}
      <div className="rounded-xl bg-gradient-to-l from-emerald-600 to-emerald-500 p-5 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold">{lesson.title}</h1>
            <p className="mt-1 text-sm text-emerald-100">
              {klass.title} - {klass.paye}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            <BookOpen size={24} />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-emerald-100">
          <div className="flex items-center gap-1.5">
            <Users size={16} />
            <span>{localStudents.length} دانش‌آموز</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen size={16} />
            <span>{lesson.units} واحد</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>نوع:</span>
            <span className="rounded bg-white/20 px-2 py-0.5 text-xs">
              {gradingType === "NUMERIC" ? "نمره‌ای (0-20)" : "توصیفی"}
            </span>
          </div>
        </div>

        {/* نوار پیشرفت */}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs text-emerald-100">
            <span>پیشرفت ثبت نمرات</span>
            <span className="font-bold">
              {stats.filled} از {stats.total} ({stats.percent}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className={`h-full rounded-full transition-all ${
                stats.percent === 100 ? "bg-white" : "bg-emerald-300"
              }`}
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* لیست دانش‌آموزان */}
      <div className="space-y-2">
        {localStudents.map((student, idx) => {
          const value = values[student.enrollmentId] ?? "";
          const isSaving = savingCells.has(student.enrollmentId);
          const isSaved = savedCells.has(student.enrollmentId);

          return (
            <div
              key={student.enrollmentId}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm"
            >
              {/* شماره */}
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600">
                {idx + 1}
              </div>

              {/* نام */}
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium text-zinc-800">
                  {student.fullName}
                </div>
                <div className="text-[10px] text-zinc-400" dir="ltr">
                  {student.nationalCode}
                </div>
              </div>

              {/* ورودی نمره */}
              <div className="relative flex flex-shrink-0 items-center gap-2">
                {gradingType === "NUMERIC" ? (
                  <input
                    type="number"
                    min={0}
                    max={20}
                    step={0.25}
                    value={value}
                    onChange={(e) =>
                      handleChange(student.enrollmentId, e.target.value)
                    }
                    className={`h-11 w-20 rounded-lg border-2 px-2 text-center text-base font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      value !== "" && Number(value) >= 10
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : value !== "" && Number(value) < 10
                          ? "border-rose-300 bg-rose-50 text-rose-700"
                          : "border-zinc-300 bg-white text-zinc-700"
                    }`}
                    placeholder="-"
                  />
                ) : (
                  <select
                    value={value}
                    onChange={(e) =>
                      handleChange(student.enrollmentId, e.target.value)
                    }
                    className="h-11 rounded-lg border-2 border-zinc-300 bg-white px-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-</option>
                    {DESCRIPTIVE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {/* ⬅️ دکمه حذف نمره */}
                {value !== "" && value !== null && value !== undefined && (
                  <button
                    type="button"
                    onClick={() => handleChange(student.enrollmentId, "")}
                    disabled={isSaving}
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-50"
                    title="پاک کردن نمره"
                  >
                    <Trash2 size={18} />
                  </button>
                )}

                {/* نشانگر ذخیره */}
                {(isSaving || isSaved) && (
                  <div className="absolute -right-1 -top-1">
                    {isSaving ? (
                      <Loader2
                        size={14}
                        className="animate-spin text-blue-500"
                      />
                    ) : (
                      <Check size={14} className="text-emerald-500" />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {localStudents.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">
            دانش‌آموزی در این کلاس وجود ندارد.
          </p>
        </div>
      )}
      <BackButton
        href={`/teacher/${schoolId}/periods/${periodId}/classes/${klassId}`}
        label="بازگشت به لیست دروس"
      />
    </div>
  );
}
