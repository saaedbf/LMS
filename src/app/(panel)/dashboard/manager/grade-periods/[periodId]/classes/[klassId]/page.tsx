import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ChevronLeft, CheckCircle, Users } from "lucide-react";
import BackButton from "@/components/widgets/Elements/BackButton";

export default async function ManagerPeriodLessonsPage({
  params,
}: {
  params: Promise<{ periodId: string; klassId: string }>;
}) {
  const { periodId, klassId } = await params;

  // ۱. گرفتن تعداد دانش‌آموزان کلاس
  const studentsCount = await prisma.studentEnrollment.count({
    where: { klassId },
  });

  // ۲. گرفتن دروس این دوره برای این کلاس
  const lessons = await prisma.gradePeriodLesson.findMany({
    where: { gradePeriodId: periodId, klassId },
    include: {
      darsPayeReshteh: {
        include: {
          reshtehTadris: true,
          classCourses: {
            where: { klassId },
            include: { teacher: true },
          },
        },
      },
      // ⬅️ گرفتن تعداد نمرات ثبت‌شده برای این درس در این کلاس
      _count: {
        select: { grades: true },
      },
    },
  });

  if (lessons.length === 0) notFound();

  return (
    <div className="space-y-4 p-2">
      <BackButton
        href={`/dashboard/manager/grade-periods/${periodId}`}
        label="بازگشت به لیست کلاس‌ها"
      />

      <div className="rounded-xl bg-gradient-to-l from-emerald-600 to-emerald-500 p-5 text-white shadow-lg">
        <h1 className="text-lg font-bold">لیست دروس</h1>
        <p className="mt-1 text-sm text-emerald-100">
          برای مدیریت نمرات، یک درس را انتخاب کنید
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-sm text-emerald-100">
          <Users size={16} />
          <span>{studentsCount} دانش‌آموز</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {lessons.map((lesson) => {
          const teacher = lesson.darsPayeReshteh.classCourses[0]?.teacher;

          // ⬅️ محاسبه درصد پیشرفت
          const gradedCount = lesson._count.grades;
          const totalExpected = studentsCount;
          const progress =
            totalExpected > 0
              ? Math.round((gradedCount / totalExpected) * 100)
              : 0;

          return (
            <Link
              key={lesson.id}
              href={`/dashboard/manager/grade-periods/${periodId}/classes/${klassId}/${lesson.darsPayeReshtehId}`}
              className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
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
                {lesson.darsPayeReshteh.reshtehTadris.title}
              </h3>
              <p className="mt-1 text-xs text-zinc-500">
                {lesson.darsPayeReshteh.units} واحد
              </p>
              <p className="mt-2 text-xs font-medium text-zinc-600">
                دبیر:{" "}
                {teacher
                  ? `${teacher.firstName} ${teacher.lastName}`
                  : "تعیین نشده"}
              </p>

              {/* ⬅️ نوار پیشرفت */}
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-[10px]">
                  <span className="text-zinc-500">پیشرفت ثبت نمره</span>
                  <span className="font-bold text-blue-600">
                    {gradedCount} از {totalExpected}
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
              {progress === 100 && totalExpected > 0 && (
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
  );
}
