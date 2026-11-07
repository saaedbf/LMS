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
  currentValue: number | string;
};

type Props = {
  periodId: string;
  klassId: string;
  lessonId: string;
  lesson: { id: string; title: string; units: number };
  klass: { id: string; title: string; paye: string; reshtehTahsili: string };
  students: Student[];
  gradingType: "DESCRIPTIVE" | "NUMERIC";
};

const DESCRIPTIVE_OPTIONS = ["خیلی خوب", "خوب", "قابل قبول", "نیاز به تلاش"];

export default function AdminGradesForm({
  periodId,
  klassId,
  lessonId,
  lesson,
  klass,
  students,
  gradingType,
}: Props) {
  const [localStudents, setLocalStudents] = useState<Student[]>(students);
  const [values, setValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    for (const s of students) initial[s.enrollmentId] = s.currentValue;
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
      for (const s of res.data.students)
        newVals[s.enrollmentId] = s.currentValue;
      setValues(newVals);
    }
  };

  const stats = useMemo(() => {
    let filled = 0;
    for (const s of localStudents) {
      const val = values[s.enrollmentId];
      if (val !== undefined && val !== null && val !== "") filled++;
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
    if (gradingType === "NUMERIC" && value !== "" && value !== null) {
      const num = Number(value);
      if (isNaN(num) || num < 0 || num > 20)
        return toast.error("نمره بین ۰ تا ۲۰");
    }

    setValues((prev) => ({ ...prev, [enrollmentId]: value }));
    setSavingCells((prev) => new Set(prev).add(enrollmentId));

    startTransition(async () => {
      try {
        const res = await saveGradeByAdmin({
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
      <div className="flex items-center justify-between ">
        <BackButton
          href={`/dashboard/manager/grade-periods/${periodId}/classes/${klassId}`}
          label="بازگشت به لیست دروس"
        />
        {/* ⬅️ دکمه ثبت نمره یکسان برای همه */}
        <BulkSameGradeModal
          periodId={periodId}
          lessonId={lessonId}
          klassId={klassId}
          gradingType={gradingType}
          onSuccess={refreshGrades} // ⬅️ برای آپدیت لیست بعد از ثبت
        />
        {/* ⬅️ دکمه ثبت گروهی */}
        <AdminBulkGradesModal
          periodId={periodId}
          lessonId={lessonId}
          klassId={klassId}
          gradingType={gradingType}
          onSuccess={refreshGrades}
        />
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
          const value = values[student.enrollmentId] ?? "";
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
                  isSaving={isSaving}
                  isSaved={isSaved}
                />
                {value !== "" && value !== null && value !== undefined && (
                  <button
                    onClick={() => handleChange(student.enrollmentId, "")}
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
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
    </div>
  );
}
