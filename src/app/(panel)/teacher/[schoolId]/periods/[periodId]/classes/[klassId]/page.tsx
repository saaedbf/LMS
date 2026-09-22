import { getClassLessonsForGrading } from "@/actions/teacherPanelActions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, ChevronLeft, CheckCircle, Users } from "lucide-react";
import BackButton from "@/components/widgets/Elements/BackButton";

type Props = {
  params: Promise<{
    schoolId: string;
    periodId: string;
    klassId: string;
  }>;
};

export default async function ClassLessonsPage({ params }: Props) {
  const { schoolId: schoolIdStr, periodId, klassId } = await params;
  const schoolId = Number(schoolIdStr);

  if (isNaN(schoolId)) notFound();

  const res = await getClassLessonsForGrading(schoolId, periodId, klassId);

  if (res.status === "error") {
    return (
      <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">
        {res.error}
      </div>
    );
  }

  const { klass, lessons, studentsCount } = res.data;

  return (
    <div className="space-y-4">
      {/* ⬅️ دکمه بازگشت */}
      <BackButton
        href={`/teacher/${schoolId}/periods/${periodId}/classes`}
        label="بازگشت به لیست کلاس‌ها"
      />
      {/* هدر */}
      <div className="rounded-xl bg-gradient-to-l from-blue-600 to-blue-500 p-5 text-white shadow-lg">
        <h1 className="text-lg font-bold">{klass.title}</h1>
        <p className="mt-1 text-sm text-blue-100">
          {klass.paye} - {klass.reshtehTahsili}
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-sm text-blue-100">
          <Users size={16} />
          <span>{studentsCount} دانش‌آموز</span>
        </div>
      </div>

      {/* لیست دروس */}
      {lessons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">
            درسی برای ثبت نمره در این کلاس وجود ندارد.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-zinc-700">
            یک درس را برای ثبت نمره انتخاب کنید:
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {lessons.map((lesson) => {
              const progress =
                lesson.totalExpected > 0
                  ? Math.round(
                      (lesson.gradedCount / lesson.totalExpected) * 100,
                    )
                  : 0;

              return (
                <Link
                  key={lesson.darsPayeReshtehId}
                  href={`/teacher/${schoolId}/periods/${periodId}/classes/${klassId}/${lesson.darsPayeReshtehId}`}
                  className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <BookOpen size={24} />
                    </div>
                    <ChevronLeft
                      size={20}
                      className="text-zinc-400 transition-transform group-hover:-translate-x-1"
                    />
                  </div>

                  <h3 className="mt-3 text-base font-bold text-zinc-800">
                    {lesson.lessonTitle}
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500">
                    {lesson.units} واحد
                  </p>

                  {/* نوار پیشرفت */}
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-[10px]">
                      <span className="text-zinc-500">پیشرفت ثبت نمره</span>
                      <span className="font-bold text-blue-600">
                        {lesson.gradedCount} از {lesson.totalExpected}
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
        </div>
      )}
      {/* ⬅️ دکمه بازگشت */}
      <BackButton
        href={`/teacher/${schoolId}/periods/${periodId}/classes`}
        label="بازگشت به لیست کلاس‌ها"
      />
    </div>
  );
}
