"use client";

import { useState, useTransition, useMemo } from "react";
import { toast } from "react-toastify";
import { Check, Loader2, Users, BookOpen, Trash2 } from "lucide-react";
import {
  saveGradeByAdmin,
  getStudentsForAdminGrading,
} from "@/actions/adminGradeActions";
import BackButton from "@/components/widgets/Elements/BackButton";
import AdminBulkGradesModal from "./AdminBulkGradesModal";
import GradeInput from "@/components/widgets/GradeInput";
import BulkSameGradeModal from "./BulkSameGradeModal";

type Student = {
  enrollmentId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  nationalCode: string;
  fullName: string;
  currentValue: number | string | null;
  // ⬅️ اضافه شدن فیلدهای تستی
  correctCount?: number | null;
  wrongCount?: number | null;
  blankCount?: number | null;
};

type Props = {
  periodId: string;
  klassId: string;
  lessonId: string;
  lesson: {
    id: string;
    title: string;
    units: number;
    questionCount?: number | null; // ⬅️ | null را اضافه کنید
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
};

export default function AdminGradesForm({
  periodId,
  klassId,
  lessonId,
  lesson,
  klass,
  students,
  gradingType,
  isTest,
  hasNegativeScore,
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
  const [isPending, startTransition] = useTransition();

  const refreshGrades = async () => {
    const res = await getStudentsForAdminGrading(periodId, klassId, lessonId);
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
    // ۱. اعتبارسنجی برای حالت عادی (غیر تستی)
    if (
      !isTest &&
      gradingType === "NUMERIC" &&
      value !== "" &&
      value !== null
    ) {
      const num = Number(value);
      if (isNaN(num) || num < 0 || num > 20)
        return toast.error("نمره باید بین ۰ تا ۲۰ باشد");
    }

    // ۲. آپدیت State
    setValues((prev) => ({ ...prev, [enrollmentId]: value }));
    setSavingCells((prev) => new Set(prev).add(enrollmentId));

    // ۳. ارسال به سرور
    startTransition(async () => {
      try {
        const res = await saveGradeByAdmin({
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
          // ⬅️ ارسال فیلدهای تستی
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
      } catch {
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
    <div className="space-y-4 p-2">
      <div className="flex items-center justify-between">
        <BackButton
          href={`/dashboard/manager/grade-periods/${periodId}/classes/${klassId}`}
          label="بازگشت به لیست دروس"
        />

        <div className="flex gap-2">
          <BulkSameGradeModal
            periodId={periodId}
            lessonId={lessonId}
            klassId={klassId}
            gradingType={gradingType}
            onSuccess={refreshGrades}
          />
          <AdminBulkGradesModal
            periodId={periodId}
            lessonId={lessonId}
            klassId={klassId}
            gradingType={gradingType}
            onSuccess={refreshGrades}
            isTest={isTest} // ⬅️ اضافه شود
            questionCount={lesson.questionCount ?? 0} // ⬅️ اضافه شود
          />
        </div>
      </div>

      <div className="rounded-xl bg-gradient-to-l from-blue-600 to-blue-500 p-5 text-white shadow-lg">
        <h1 className="text-lg font-bold">{lesson.title}</h1>
        <p className="mt-1 text-sm text-blue-100">
          {klass.title} - {klass.paye}
        </p>
        <div className="mt-3 flex gap-3 text-sm text-blue-100">
          <span className="flex items-center gap-1">
            <Users size={16} /> {localStudents.length} دانش‌آموز
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={16} /> {lesson.units} واحد
          </span>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-blue-100">
            <span>پیشرفت</span>
            <span className="font-bold">
              {stats.filled} از {stats.total} ({stats.percent}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>
      </div>

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
              className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium">
                  {student.fullName}
                </div>
                <div className="text-[10px] text-zinc-400" dir="ltr">
                  {student.nationalCode}
                </div>
              </div>
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
                  isPeriodActive={true}
                />
                {/* دکمه حذف برای حالت عادی (در حالت تستی داخل کامپوننت GradeInput مدیریت می‌شود) */}
                {!isTest &&
                  value !== "" &&
                  value !== null &&
                  value !== undefined && (
                    <button
                      onClick={() => handleChange(student.enrollmentId, "")}
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
