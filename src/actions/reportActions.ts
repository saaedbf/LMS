"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentContext } from "@/actions/authActions";
import { getAcademicReportData } from "@/actions/academicReportActions";

// گرفتن لیست دوره‌ها، پایه‌ها و کلاس‌ها برای فیلتر
export async function getReportFilterData() {
  const context = await getCurrentContext();
  if (!context?.schoolId || !context?.academicYearId) {
    return { status: "error" as const, error: "کانتکست یافت نشد" };
  }

  const { schoolId, academicYearId } = context;

  const [periods, klasses] = await Promise.all([
    prisma.gradePeriod.findMany({
      where: { schoolId, academicYearId, isActive: true, isVisible: true },
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.klass.findMany({
      where: { schoolId, academicYearId },
      include: { paye: true },
      orderBy: [{ payeId: "asc" }, { title: "asc" }],
    }),
  ]);

  // گروه‌بندی کلاس‌ها بر اساس پایه
  const payeMap = new Map<
    number,
    {
      payeId: number;
      payeTitle: string;
      klasses: { id: string; title: string }[];
    }
  >();
  for (const k of klasses) {
    if (!payeMap.has(k.payeId)) {
      payeMap.set(k.payeId, {
        payeId: k.payeId,
        payeTitle: k.paye.title,
        klasses: [],
      });
    }
    payeMap.get(k.payeId)!.klasses.push({ id: k.id, title: k.title });
  }

  return {
    status: "success" as const,
    data: {
      periods,
      payes: Array.from(payeMap.values()),
    },
  };
}

// گرفتن لیست دانش‌آموزان یک کلاس در یک دوره (برای گزارش تفضیلی)
export async function getDetailedReportData(periodId: string, klassId: string) {
  const context = await getCurrentContext();
  if (!context?.schoolId || !context?.academicYearId) {
    return { lessons: [], students: [], klassTitle: "", periodTitle: "" };
  }

  const { schoolId, academicYearId } = context;

  const [klassInfo, periodInfo] = await Promise.all([
    prisma.klass.findUnique({
      where: { id: klassId },
      select: { title: true },
    }),
    prisma.gradePeriod.findUnique({
      where: { id: periodId },
      select: { title: true },
    }),
  ]);

  const enrollments = await prisma.studentEnrollment.findMany({
    where: { klassId, schoolId, academicYearId },
    include: { student: true },
    // ⬅️ دیگر نیازی به سورت بر اساس فامیل در دیتابیس نیست، چون در حافظه سورت می‌کنیم
    // orderBy: [{ student: { lastName: "asc" } }, { student: { firstName: "asc" } }],
  });

  const lessons = await prisma.gradePeriodLesson.findMany({
    where: { gradePeriodId: periodId, klassId },
    include: { darsPayeReshteh: { include: { reshtehTadris: true } } },
    orderBy: { darsPayeReshteh: { reshtehTadris: { title: "asc" } } },
  });

  const grades = await prisma.grade.findMany({
    where: {
      gradePeriodLessonId: { in: lessons.map((l) => l.id) },
      studentEnrollmentId: { in: enrollments.map((e) => e.id) },
    },
  });

  const gradeMap = new Map(
    grades.map((g) => [`${g.studentEnrollmentId}_${g.gradePeriodLessonId}`, g]),
  );

  let studentsData = enrollments.map((e) => {
    let totalScore = 0;
    let totalUnits = 0;
    const lessonScores = lessons.map((l) => {
      const g = gradeMap.get(`${e.id}_${l.id}`);
      if (g && g.score !== null) {
        totalScore += g.score * l.darsPayeReshteh.units;
        totalUnits += l.darsPayeReshteh.units;
      }
      return {
        lessonTitle: l.darsPayeReshteh.reshtehTadris.title,
        score: g?.score ?? null,
      };
    });

    return {
      fullName: `${e.student.firstName} ${e.student.lastName}`,
      nationalCode: e.student.nationalCode,
      average: totalUnits > 0 ? totalScore / totalUnits : 0,
      scores: lessonScores,
    };
  });

  // ⬅️ سورت نهایی: از بالاترین معدل به پایین‌ترین
  studentsData.sort((a, b) => b.average - a.average);

  return {
    lessons: lessons.map((l) => l.darsPayeReshteh.reshtehTadris.title),
    students: studentsData,
    klassTitle: klassInfo?.title ?? "",
    periodTitle: periodInfo?.title ?? "",
  };
}
