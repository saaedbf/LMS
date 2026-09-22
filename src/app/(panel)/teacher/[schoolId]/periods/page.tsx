// app/dashboard/teacher/[schoolId]/periods/page.tsx
import { getActiveGradePeriodsForTeacher } from "@/actions/teacherPanelActions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, ChevronLeft, BookOpen, Users } from "lucide-react";
import BackButton from "@/components/widgets/Elements/BackButton";

type Props = {
  params: Promise<{ schoolId: string }>;
};

export default async function TeacherPeriodsPage({ params }: Props) {
  const { schoolId: schoolIdStr } = await params;
  const schoolId = Number(schoolIdStr);

  if (isNaN(schoolId)) notFound();

  const res = await getActiveGradePeriodsForTeacher(schoolId);

  if (res.status === "error") {
    return (
      <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">
        {res.error}
      </div>
    );
  }

  const { periods } = res.data;

  return (
    <div className="space-y-4">
      {/* ⬅️ دکمه بازگشت */}

      <div className="rounded-xl bg-gradient-to-l from-blue-600 to-blue-500 p-5 text-white shadow-lg">
        <h1 className="text-lg font-bold">دوره‌های ثبت نمره فعال</h1>
        <p className="mt-1 text-sm text-blue-100">
          یک دوره را برای ثبت نمرات انتخاب کنید.
        </p>
      </div>
      <BackButton href="/teacher" label="بازگشت به لیست مدارس" />
      {periods.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">
            هیچ دوره ثبت نمره فعالی وجود ندارد.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {periods.map((period) => (
            <Link
              key={period.id}
              href={`/teacher/${schoolId}/periods/${period.id}/classes`}
              className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Calendar size={24} />
                </div>
                <ChevronLeft
                  size={20}
                  className="text-zinc-400 transition-transform group-hover:-translate-x-1"
                />
              </div>

              <h3 className="mt-3 text-base font-bold text-zinc-800">
                {period.title}
              </h3>

              {period.description && (
                <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                  {period.description}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-zinc-500">
                <div className="flex items-center gap-1">
                  <Users size={12} />
                  <span>{period._count.klassPeriods} کلاس</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen size={12} />
                  <span>{period._count.lessonPeriods} درس</span>
                </div>
              </div>

              {period.startDate && (
                <div className="mt-2 text-[10px] text-zinc-400">
                  شروع: {new Date(period.startDate).toLocaleDateString("fa-IR")}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
