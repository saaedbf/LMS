// app/dashboard/teacher/[schoolId]/periods/[periodId]/classes/page.tsx
import { getTeacherClassesInPeriod } from "@/actions/teacherPanelActions";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Users,
  BookOpen,
  CheckCircle,
  GraduationCap,
} from "lucide-react";
import BackButton from "@/components/widgets/Elements/BackButton";

type Props = {
  params: Promise<{ schoolId: string; periodId: string }>;
};

export default async function TeacherClassesPage({ params }: Props) {
  const { schoolId: schoolIdStr, periodId } = await params;
  const schoolId = Number(schoolIdStr);

  if (isNaN(schoolId)) notFound();

  const res = await getTeacherClassesInPeriod(schoolId, periodId);

  if (res.status === "error") {
    return (
      <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">
        {res.error}
      </div>
    );
  }

  const { classes, period } = res.data;

  return (
    <div className="space-y-4">
      {/* ⬅️ دکمه بازگشت */}
      <BackButton
        href={`/teacher/${schoolId}/periods`}
        label="بازگشت به لیست دوره‌ها"
      />
      <div className="rounded-xl bg-gradient-to-l from-blue-600 to-blue-500 p-5 text-white shadow-lg">
        <h1 className="text-lg font-bold">{period.title}</h1>
        <p className="mt-1 text-sm text-blue-100">
          کلاسی که در آن تدریس می‌کنید را انتخاب کنید.
        </p>
      </div>

      {classes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">
            شما در هیچ کلاسی از این دوره درس ندارید.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls: any) => {
            const progress =
              cls.totalStudents > 0
                ? Math.round((cls.gradedCount / cls.totalStudents) * 100)
                : 0;

            return (
              <Link
                key={cls.klassId}
                href={`/teacher/${schoolId}/periods/${periodId}/classes/${cls.klassId}`}
                className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <GraduationCap size={24} />
                  </div>
                  <ChevronLeft
                    size={20}
                    className="text-zinc-400 transition-transform group-hover:-translate-x-1"
                  />
                </div>

                <h3 className="mt-3 text-base font-bold text-zinc-800">
                  {cls.klassTitle}
                </h3>

                <p className="mt-1 text-xs text-zinc-500">
                  {cls.payeTitle} - {cls.reshtehTahsiliTitle}
                </p>

                <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-zinc-500">
                  <div className="flex items-center gap-1">
                    <Users size={12} />
                    <span>{cls.totalStudents} دانش‌آموز</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen size={12} />
                    <span>{cls.totalLessons} درس</span>
                  </div>
                </div>

                {/* نوار پیشرفت */}
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-[10px]">
                    <span className="text-zinc-500">پیشرفت ثبت نمره</span>
                    <span className="font-bold text-blue-600">
                      {cls.gradedCount} از {cls.totalStudents}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className={`h-full rounded-full transition-all ${
                        progress === 100
                          ? "bg-emerald-500"
                          : progress > 0
                            ? "bg-blue-500"
                            : "bg-zinc-300"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* نشان تکمیل */}
                {progress === 100 && (
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600">
                    <CheckCircle size={12} />
                    <span>تکمیل شده</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
