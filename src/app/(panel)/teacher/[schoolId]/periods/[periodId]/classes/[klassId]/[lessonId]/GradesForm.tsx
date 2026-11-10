"use client";

import { useState, useTransition, useMemo } from "react";
import { toast } from "react-toastify";
import {
  Check,
  Loader2,
  Users,
  BookOpen,
  Trash2,
  ArrowRight,
  FileDown,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  saveGrade,
  getClassStudentsWithGrades,
} from "@/actions/teacherPanelActions";
import BackButton from "@/components/widgets/Elements/BackButton";
import BulkGradesModal from "./BulkGradesModal";
import { useRouter } from "next/navigation";
import GradeInput from "@/components/widgets/GradeInput";

type Student = {
  enrollmentId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  nationalCode: string;
  fullName: string;
  currentValue: number | string | null;
  correctCount?: number | null;
  wrongCount?: number | null;
  blankCount?: number | null;
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
    questionCount?: number | null;
  };
  klass: {
    id: string;
    title: string;
    paye: string;
    reshtehTahsili: string;
  };
  students: Student[];
  gradingType: "DESCRIPTIVE" | "NUMERIC";
  isTest: boolean;
  hasNegativeScore: boolean;
  isPeriodActive: boolean;
};

export default function GradesForm({
  schoolId,
  periodId,
  klassId,
  lessonId,
  lesson,
  klass,
  students,
  gradingType,
  isTest,
  hasNegativeScore,
  isPeriodActive,
}: Props) {
  const [localStudents, setLocalStudents] = useState<Student[]>(students);

  const [values, setValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    for (const s of students) {
      if (isTest) {
        initial[s.enrollmentId] = {
          correctCount: s.correctCount ?? "",
          wrongCount: s.wrongCount ?? "",
          blankCount: s.blankCount ?? "",
        };
      } else {
        initial[s.enrollmentId] = s.currentValue;
      }
    }
    return initial;
  });

  const [savingCells, setSavingCells] = useState<Set<string>>(new Set());
  const [savedCells, setSavedCells] = useState<Set<string>>(new Set());
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleBack = () => {
    router.push(`/teacher/${schoolId}/periods/${periodId}/classes/${klassId}`);
    router.refresh();
  };

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
        if (isTest) {
          newVals[s.enrollmentId] = {
            correctCount: s.correctCount ?? "",
            wrongCount: s.wrongCount ?? "",
            blankCount: s.blankCount ?? "",
          };
        } else {
          newVals[s.enrollmentId] = s.currentValue;
        }
      }
      setValues(newVals);
    }
  };

  // ⬅️ خروجی اکسل
  const handleExportExcel = () => {
    const data = localStudents.map((s, idx) => {
      const val = values[s.enrollmentId];
      const row: any = {
        ردیف: idx + 1,
        "نام و نام خانوادگی": s.fullName,
        "کد ملی": s.nationalCode,
      };

      if (isTest) {
        row["تعداد صحیح"] = val?.correctCount ?? "";
        row["تعداد اشتباه"] = val?.wrongCount ?? "";
        row["تعداد بی‌پاسخ"] = val?.blankCount ?? "";

        const correct = Number(val?.correctCount) || 0;
        const wrong = Number(val?.wrongCount) || 0;
        const qCount = lesson.questionCount || 1;

        let rawScore = correct;
        if (hasNegativeScore) rawScore = correct - wrong / 3;
        if (rawScore < 0) rawScore = 0;

        const percentage = (rawScore / qCount) * 100;
        const score20 = (percentage / 100) * 20;

        row["درصد"] = `${percentage.toFixed(1)}%`;
        row["نمره (20)"] = score20.toFixed(2);
      } else {
        row["نمره"] = val !== "" && val !== null ? Number(val) : "";
      }
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "نمرات");
    XLSX.writeFile(wb, `نمرات-${klass.title}-${lesson.title}.xlsx`);
  };

  // ⬅️ خروجی PDF
  const handleExportPdf = () => {
    window.open(
      `/api/teacher-grades-pdf?periodId=${periodId}&klassId=${klassId}&lessonId=${lessonId}`,
      "_blank",
    );
  };

  const stats = useMemo(() => {
    let filled = 0;
    for (const s of localStudents) {
      const val = values[s.enrollmentId];
      if (isTest) {
        if (
          val &&
          (val.correctCount !== "" ||
            val.wrongCount !== "" ||
            val.blankCount !== "")
        ) {
          filled++;
        }
      } else {
        if (val !== undefined && val !== null && val !== "") filled++;
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
  }, [values, localStudents, isTest]);

  const handleChange = (enrollmentId: string, value: any) => {
    if (!isPeriodActive) return;

    if (
      !isTest &&
      gradingType === "NUMERIC" &&
      value !== "" &&
      value !== null
    ) {
      const num = Number(value);
      if (isNaN(num) || num < 0 || num > 20) {
        toast.error("نمره باید بین ۰ تا ۲۰ باشد");
        return;
      }
    }

    setValues((prev) => ({ ...prev, [enrollmentId]: value }));
    setSavingCells((prev) => new Set(prev).add(enrollmentId));

    startTransition(async () => {
      try {
        const res = await saveGrade({
          enrollmentId,
          darsPayeReshtehId: lessonId,
          periodId,
          score: isTest
            ? null
            : gradingType === "NUMERIC" && value !== "" && value !== null
              ? Number(value)
              : null,
          descriptiveValue:
            !isTest && gradingType === "DESCRIPTIVE" && value !== ""
              ? value
              : null,
          correctCount: isTest
            ? value?.correctCount !== ""
              ? Number(value?.correctCount)
              : null
            : null,
          wrongCount: isTest
            ? value?.wrongCount !== ""
              ? Number(value?.wrongCount)
              : null
            : null,
          blankCount: isTest
            ? value?.blankCount !== ""
              ? Number(value?.blankCount)
              : null
            : null,
        });

        if (res.status === "error") {
          toast.error(res.error);
        } else {
          setSavedCells((prev) => new Set(prev).add(enrollmentId));
          setTimeout(() => {
            setSavedCells((prev) => {
              const next = new Set(prev);
              next.delete(enrollmentId);
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
          next.delete(enrollmentId);
          return next;
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          <ArrowRight size={16} />
          بازگشت به لیست دروس
        </button>

        {/* ⬅️ دکمه‌های خروجی و ثبت گروهی */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 sm:text-sm"
          >
            <FileSpreadsheet size={16} />
            اکسل
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 sm:text-sm"
          >
            <FileDown size={16} />
            PDF
          </button>

          {isPeriodActive && (
            <BulkGradesModal
              periodId={periodId}
              lessonId={lessonId}
              klassId={klassId}
              gradingType={gradingType}
              isTest={isTest}
              questionCount={lesson.questionCount ?? 0}
              onSuccess={refreshGrades}
            />
          )}
        </div>
      </div>

      <div className="rounded-xl bg-gradient-to-l from-emerald-600 to-emerald-500 p-4 sm:p-5 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-base sm:text-lg font-bold">{lesson.title}</h1>
            <p className="mt-1 text-xs sm:text-sm text-emerald-100">
              {klass.title} - {klass.paye}
            </p>
          </div>
          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            <BookOpen size={24} />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-emerald-100">
          <div className="flex items-center gap-1.5">
            <Users size={14} className="sm:w-4 sm:h-4" />
            <span>{localStudents.length} دانش‌آموز</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen size={14} className="sm:w-4 sm:h-4" />
            <span>{lesson.units} واحد</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>نوع:</span>
            <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] sm:text-xs">
              {isTest
                ? "تستی"
                : gradingType === "NUMERIC"
                  ? "نمره‌ای"
                  : "توصیفی"}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-[10px] sm:text-xs text-emerald-100">
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

      {!isPeriodActive && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          ⚠️ این دوره ثبت نمره غیرفعال است. شما می‌توانید نمرات را مشاهده کنید
          اما امکان ویرایش یا ثبت جدید ندارید.
        </div>
      )}

      <div className="space-y-2">
        {localStudents.map((student, idx) => {
          const value =
            values[student.enrollmentId] ??
            (isTest
              ? { correctCount: "", wrongCount: "", blankCount: "" }
              : "");
          const isSaving = savingCells.has(student.enrollmentId);
          const isSaved = savedCells.has(student.enrollmentId);

          return (
            <div
              key={student.enrollmentId}
              className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 rounded-xl border border-zinc-200 bg-white p-2 sm:p-3 shadow-sm ${
                isTest ? "sm:flex-nowrap" : ""
              }`}
            >
              <div className="flex w-full items-center gap-2 sm:w-auto sm:flex-1">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] sm:text-xs font-bold text-zinc-600">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-xs sm:text-sm font-medium text-zinc-800">
                    {student.fullName}
                  </div>
                  {!isTest && (
                    <div
                      className="hidden sm:block text-[10px] text-zinc-400"
                      dir="ltr"
                    >
                      {student.nationalCode}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
                <div className="relative flex items-center gap-2">
                  <GradeInput
                    value={value}
                    onChange={(val) => handleChange(student.enrollmentId, val)}
                    gradingType={gradingType}
                    isTest={isTest}
                    hasNegativeScore={hasNegativeScore}
                    questionCount={lesson.questionCount || 0}
                    isSaving={isSaving}
                    isSaved={isSaved}
                    isPeriodActive={isPeriodActive}
                  />

                  {!isTest &&
                    value !== "" &&
                    value !== null &&
                    value !== undefined && (
                      <button
                        type="button"
                        onClick={() => handleChange(student.enrollmentId, "")}
                        disabled={isSaving || !isPeriodActive}
                        className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-50"
                        title="پاک کردن نمره"
                      >
                        <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                    )}
                </div>
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

      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
      >
        <ArrowRight size={16} />
        بازگشت به لیست دروس
      </button>
    </div>
  );
}
