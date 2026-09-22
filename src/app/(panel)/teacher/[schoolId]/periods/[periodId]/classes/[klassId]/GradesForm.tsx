"use client";

import { useState, useTransition, useMemo } from "react";
import { toast } from "react-toastify";
import { Check, Loader2, Users, BookOpen } from "lucide-react";
import { saveGrade } from "@/actions/teacherPanelActions";
import BackButton from "@/components/widgets/Elements/BackButton";

type Student = {
  enrollmentId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  nationalCode: string;
  fullName: string;
  grades: Record<string, number | string>;
};

type Lesson = {
  classCourseId: string;
  darsPayeReshtehId: string;
  lessonTitle: string;
};

type Props = {
  schoolId: number;
  periodId: string;
  klassId: string;
  students: Student[];
  lessons: Lesson[];
  gradingType: "DESCRIPTIVE" | "NUMERIC";
};

// مقادیر توصیفی
const DESCRIPTIVE_OPTIONS = [
  { value: "خیلی خوب", color: "bg-emerald-100 text-emerald-700" },
  { value: "خوب", color: "bg-blue-100 text-blue-700" },
  { value: "قابل قبول", color: "bg-amber-100 text-amber-700" },
  { value: "نیاز به تلاش", color: "bg-rose-100 text-rose-700" },
];

export default function GradesForm({
  schoolId,
  periodId,
  klassId,
  students,
  lessons,
  gradingType,
}: Props) {
  // state محلی برای نمرات
  const [grades, setGrades] = useState<Record<string, Record<string, any>>>(
    () => {
      const initial: Record<string, Record<string, any>> = {};
      for (const s of students) {
        initial[s.enrollmentId] = { ...s.grades };
      }
      return initial;
    },
  );

  const [savingCells, setSavingCells] = useState<Set<string>>(new Set());
  const [savedCells, setSavedCells] = useState<Set<string>>(new Set());

  const [isPending, startTransition] = useTransition();

  // محاسبه پیشرفت
  const stats = useMemo(() => {
    let total = 0;
    let filled = 0;

    for (const s of students) {
      for (const l of lessons) {
        total++;
        const val = grades[s.enrollmentId]?.[l.darsPayeReshtehId];
        if (val !== undefined && val !== null && val !== "") {
          filled++;
        }
      }
    }

    return {
      total,
      filled,
      percent: total > 0 ? Math.round((filled / total) * 100) : 0,
    };
  }, [grades, students, lessons]);

  // تابع ذخیره نمره
  const handleGradeChange = (
    enrollmentId: string,
    darsPayeReshtehId: string,
    value: any,
  ) => {
    // ⬅️ اعتبارسنجی محدوده برای نمره‌ای
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

    // به‌روزرسانی state
    setGrades((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [darsPayeReshtehId]: value,
      },
    }));

    // ذخیره در سرور
    const cellKey = `${enrollmentId}-${darsPayeReshtehId}`;
    setSavingCells((prev) => new Set(prev).add(cellKey));

    startTransition(async () => {
      try {
        const res = await saveGrade({
          enrollmentId,
          darsPayeReshtehId,
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
          }, 2000);
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
      {/* ⬅️ دکمه بازگشت */}

      {/* هدر */}
      <div className="rounded-xl bg-gradient-to-l from-blue-600 to-blue-500 p-5 text-white shadow-lg">
        <h1 className="text-lg font-bold">ثبت نمرات</h1>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-blue-100">
          <div className="flex items-center gap-1.5">
            <Users size={16} />
            <span>{students.length} دانش‌آموز</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen size={16} />
            <span>{lessons.length} درس</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>نوع ثبت:</span>
            <span className="rounded bg-white/20 px-2 py-0.5 text-xs">
              {gradingType === "NUMERIC" ? "نمره‌ای (0-20)" : "توصیفی"}
            </span>
          </div>
        </div>

        {/* نوار پیشرفت */}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs text-blue-100">
            <span>پیشرفت ثبت نمرات</span>
            <span className="font-bold">
              {stats.filled} از {stats.total} ({stats.percent}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className={`h-full rounded-full transition-all ${
                stats.percent === 100 ? "bg-emerald-300" : "bg-white"
              }`}
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* جدول نمرات */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead className="bg-zinc-50">
              <tr>
                <th className="sticky right-0 z-10 border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-right text-xs font-medium text-zinc-500">
                  نام دانش‌آموز
                </th>
                {lessons.map((lesson) => (
                  <th
                    key={lesson.darsPayeReshtehId}
                    className="border-b border-zinc-200 px-4 py-3 text-center text-xs font-medium text-zinc-500"
                  >
                    {lesson.lessonTitle}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {students.map((student, idx) => (
                <tr
                  key={student.enrollmentId}
                  className={`border-b border-zinc-100 ${
                    idx % 2 === 0 ? "bg-white" : "bg-zinc-50/50"
                  }`}
                >
                  <td className="sticky right-0 z-10 bg-inherit px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                        {student.firstName[0]}
                        {student.lastName[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-800">
                          {student.fullName}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {student.nationalCode}
                        </span>
                      </div>
                    </div>
                  </td>

                  {lessons.map((lesson) => {
                    const cellKey = `${student.enrollmentId}-${lesson.darsPayeReshtehId}`;
                    const value =
                      grades[student.enrollmentId]?.[
                        lesson.darsPayeReshtehId
                      ] ?? "";
                    const isSaving = savingCells.has(cellKey);
                    const isSaved = savedCells.has(cellKey);

                    return (
                      <td
                        key={lesson.darsPayeReshtehId}
                        className="px-4 py-2.5 text-center"
                      >
                        <div className="relative flex items-center justify-center">
                          {gradingType === "NUMERIC" ? (
                            <input
                              type="number"
                              min={0}
                              max={20}
                              step={0.25}
                              value={value}
                              onChange={(e) =>
                                handleGradeChange(
                                  student.enrollmentId,
                                  lesson.darsPayeReshtehId,
                                  e.target.value,
                                )
                              }
                              className={`w-16 rounded-lg border px-2 py-1.5 text-center text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                                handleGradeChange(
                                  student.enrollmentId,
                                  lesson.darsPayeReshtehId,
                                  e.target.value,
                                )
                              }
                              className="w-28 rounded-lg border border-zinc-300 px-2 py-1.5 text-center text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">انتخاب...</option>
                              {DESCRIPTIVE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.value}
                                </option>
                              ))}
                            </select>
                          )}

                          {/* نشانگر ذخیره */}
                          {(isSaving || isSaved) && (
                            <div className="absolute -left-1 -top-1">
                              {isSaving ? (
                                <Loader2
                                  size={12}
                                  className="animate-spin text-blue-500"
                                />
                              ) : (
                                <Check size={12} className="text-emerald-500" />
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* پیام خالی */}
      {students.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">
            دانش‌آموزی در این کلاس وجود ندارد.
          </p>
        </div>
      )}

      {lessons.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">
            درسی برای ثبت نمره در این کلاس وجود ندارد.
          </p>
        </div>
      )}
    </div>
  );
}
