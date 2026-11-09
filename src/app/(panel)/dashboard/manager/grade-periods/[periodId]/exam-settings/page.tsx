import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ExamSettingsForm from "./ExamSettingsForm";
import BackButton from "@/components/widgets/Elements/BackButton";

export default async function ExamSettingsPage({
  params,
}: {
  params: Promise<{ periodId: string }>;
}) {
  const { periodId } = await params;

  const period = await prisma.gradePeriod.findUnique({
    where: { id: periodId },
    include: {
      lessonPeriods: {
        include: {
          klass: { select: { id: true, title: true, payeId: true } },
          darsPayeReshteh: {
            include: {
              reshtehTadris: { select: { title: true } },
              paye: { select: { id: true, title: true } },
            },
          },
        },
      },
    },
  });

  if (!period || period.examType !== "TEST") {
    notFound();
  }

  // ⬅️ ادغام رکوردها بر اساس (پایه، درس)
  const uniqueLessons = new Map<
    string,
    {
      darsPayeReshtehId: string;
      payeTitle: string;
      lessonTitle: string;
      questionCount: number | null;
      questionRange: string | null;
      // لیست رکوردهای GradePeriodLesson برای آپدیت دسته‌جمعی
      gradePeriodLessonIds: string[];
    }
  >();

  for (const lp of period.lessonPeriods) {
    const key = `${lp.darsPayeReshteh.paye.id}-${lp.darsPayeReshtehId}`;

    if (!uniqueLessons.has(key)) {
      uniqueLessons.set(key, {
        darsPayeReshtehId: lp.darsPayeReshtehId,
        payeTitle: lp.darsPayeReshteh.paye.title,
        lessonTitle: lp.darsPayeReshteh.reshtehTadris.title,
        questionCount: lp.questionCount,
        questionRange: lp.questionRange,
        gradePeriodLessonIds: [lp.id],
      });
    } else {
      // اگر برای کلاس دیگری از همان پایه بود، فقط ID را اضافه کن
      uniqueLessons.get(key)!.gradePeriodLessonIds.push(lp.id);
    }
  }

  return (
    <div className="space-y-4 p-2">
      <BackButton
        href="/dashboard/manager/grade-periods"
        label="بازگشت به لیست دوره‌ها"
      />

      <div className="rounded-xl bg-gradient-to-l from-purple-600 to-purple-500 p-5 text-white shadow-lg">
        <h1 className="text-lg font-bold">تنظیمات آزمون تستی</h1>
        <p className="mt-1 text-sm text-purple-100">
          دوره: {period.title} {period.hasNegativeScore && "| (نمره منفی دارد)"}
        </p>
        <p className="mt-1 text-xs text-purple-200">
          تنظیمات برای هر درس در هر پایه اعمال می‌شود و شامل تمام کلاس‌های آن
          پایه است.
        </p>
      </div>

      <ExamSettingsForm
        periodId={period.id}
        lessons={Array.from(uniqueLessons.values())}
      />
    </div>
  );
}
