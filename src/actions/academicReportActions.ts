"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentContext } from "@/actions/authActions";

export type AcademicReportData = {
  student: {
    firstName: string;
    lastName: string;
    nationalCode: string;
    fatherName: string | null;
  };
  school: { title: string };
  academicYear: { title: string };
  klass: { title: string; paye: string; reshteh: string };
  period: { title: string };
  lessons: Array<{
    lessonTitle: string;
    units: number;
    teacherName: string;
    score: number | null;
    descriptiveValue: string | null;
    classRank: number | null;
    gradeRank: number | null;
    classAvg: number;
  }>;
  studentAverage: number;
  classRank: number;
  classSize: number;
  gradeRank: number;
  gradeSize: number;
  top3Class: Array<{ name: string; klass: string; avg: number }>;
  top3Grade: Array<{ name: string; klass: string; avg: number }>;
};

export async function getAcademicReportData(
  enrollmentId: string,
  periodId: string,
): Promise<
  | { status: "ok"; data: AcademicReportData }
  | { status: "error"; error: string }
> {
  const context = await getCurrentContext();
  if (!context?.schoolId || !context?.academicYearId) {
    return { status: "error", error: "کانتکست یافت نشد" };
  }

  const { schoolId, academicYearId } = context;

  try {
    // ۱. اطلاعات ثبت‌نام و دانش‌آموز
    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: true,
        school: true,
        academicYear: true,
        klass: { include: { paye: true, reshtehTahsili: true } },
      },
    });

    if (!enrollment) return { status: "error", error: "ثبت‌نام یافت نشد" };

    // ۲. اطلاعات دوره
    const period = await prisma.gradePeriod.findUnique({
      where: { id: periodId },
    });
    if (!period) return { status: "error", error: "دوره یافت نشد" };

    // ۳. درس‌های این دوره برای کلاس این دانش‌آموز
    const periodLessons = await prisma.gradePeriodLesson.findMany({
      where: {
        gradePeriodId: periodId,
        klassId: enrollment.klassId,
      },
      include: {
        darsPayeReshteh: {
          include: {
            reshtehTadris: true,
            classCourses: {
              where: { klassId: enrollment.klassId },
              include: { teacher: true },
            },
          },
        },
      },
      orderBy: {
        darsPayeReshteh: { reshtehTadris: { title: "asc" } },
      },
    });

    if (periodLessons.length === 0) {
      return {
        status: "error",
        error: "هیچ درسی در این دوره برای این کلاس ثبت نشده است.",
      };
    }

    // ۴. تمام دانش‌آموزان کلاس
    const classEnrollments = await prisma.studentEnrollment.findMany({
      where: { klassId: enrollment.klassId, schoolId, academicYearId },
      include: { student: true },
    });

    // ۵. تمام دانش‌آموزان پایه (برای رتبه در پایه)
    const gradeEnrollments = await prisma.studentEnrollment.findMany({
      where: {
        schoolId,
        academicYearId,
        payeId: enrollment.payeId,
        reshtehTahsiliId: enrollment.reshtehTahsiliId,
      },
      include: { student: true, klass: true },
    });

    // ۶. گرفتن تمام نمرات مربوط به این دوره برای تمام دانش‌آموزان درگیر
    const allGrades = await prisma.grade.findMany({
      where: {
        gradePeriodLessonId: { in: periodLessons.map((l) => l.id) },
        studentEnrollmentId: {
          in: Array.from(
            new Set([
              ...classEnrollments.map((e) => e.id),
              ...gradeEnrollments.map((e) => e.id),
            ]),
          ),
        },
      },
    });

    // نگاشت نمرات
    const gradeMap = new Map();
    for (const g of allGrades) {
      gradeMap.set(`${g.studentEnrollmentId}_${g.gradePeriodLessonId}`, g);
    }

    // ۷. تابع محاسبه معدل
    const calcAvg = (studentEnrollmentId: string) => {
      let totalScore = 0;
      let totalUnits = 0;
      for (const lesson of periodLessons) {
        const g = gradeMap.get(`${studentEnrollmentId}_${lesson.id}`);
        if (g && g.score !== null) {
          totalScore += g.score * lesson.darsPayeReshteh.units;
          totalUnits += lesson.darsPayeReshteh.units;
        }
      }
      return totalUnits > 0 ? totalScore / totalUnits : 0;
    };

    // ۸. محاسبه معدل و رتبه کلاس
    const classAverages = classEnrollments
      .map((e) => ({
        enrollmentId: e.id,
        student: e.student,
        avg: calcAvg(e.id),
      }))
      .sort((a, b) => b.avg - a.avg);

    // ۹. محاسبه معدل و رتبه پایه (با استفاده از ثبت‌نام خود هر دانش‌آموز در پایه)
    const gradeAverages = gradeEnrollments
      .map((e) => ({
        enrollmentId: e.id,
        student: e.student,
        klass: e.klass,
        avg: calcAvg(e.id),
      }))
      .sort((a, b) => b.avg - a.avg);

    // ۱۰. محاسبه رتبه‌های تک‌تک دروس
    const lessonsData = periodLessons.map((lesson) => {
      const studentGrade = gradeMap.get(`${enrollmentId}_${lesson.id}`);
      const teacher = lesson.darsPayeReshteh.classCourses[0]?.teacher;

      const classLessonScores = classEnrollments
        .map((e) => gradeMap.get(`${e.id}_${lesson.id}`)?.score)
        .filter((s) => s !== undefined && s !== null) as number[];
      const gradeLessonScores = gradeEnrollments
        .map((e) => gradeMap.get(`${e.id}_${lesson.id}`)?.score)
        .filter((s) => s !== undefined && s !== null) as number[];

      let classRank = null;
      let gradeRank = null;
      if (studentGrade && studentGrade.score !== null) {
        classRank =
          classLessonScores.filter((s) => s > studentGrade.score!).length + 1;
        gradeRank =
          gradeLessonScores.filter((s) => s > studentGrade.score!).length + 1;
      }

      const classAvg =
        classLessonScores.length > 0
          ? classLessonScores.reduce((a, b) => a + b, 0) /
            classLessonScores.length
          : 0;

      return {
        lessonTitle: lesson.darsPayeReshteh.reshtehTadris.title,
        units: lesson.darsPayeReshteh.units,
        teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : "-",
        score: studentGrade?.score ?? null,
        descriptiveValue: studentGrade?.descriptiveValue ?? null,
        classRank,
        gradeRank,
        classAvg,
      };
    });

    // ۱۱. معدل و رتبه خود دانش‌آموز
    const studentAvg = calcAvg(enrollmentId);
    const classRank =
      classAverages.findIndex((e) => e.enrollmentId === enrollmentId) + 1;
    const gradeRank =
      gradeAverages.findIndex((e) => e.enrollmentId === enrollmentId) + 1;

    return {
      status: "ok",
      data: {
        student: {
          firstName: enrollment.student.firstName,
          lastName: enrollment.student.lastName,
          nationalCode: enrollment.student.nationalCode,
          fatherName: enrollment.student.fatherName,
        },
        school: { title: enrollment.school.title },
        academicYear: { title: enrollment.academicYear.title },
        klass: {
          title: enrollment.klass.title,
          paye: enrollment.klass.paye.title,
          reshteh: enrollment.klass.reshtehTahsili.title,
        },
        period: { title: period.title },
        lessons: lessonsData,
        studentAverage: studentAvg,
        classRank: classRank > 0 ? classRank : 0,
        classSize: classAverages.length,
        gradeRank: gradeRank > 0 ? gradeRank : 0,
        gradeSize: gradeAverages.length,
        top3Class: classAverages.slice(0, 3).map((e) => ({
          name: `${e.student.firstName} ${e.student.lastName}`,
          klass: enrollment.klass.title,
          avg: Number(e.avg.toFixed(2)),
        })),
        top3Grade: gradeAverages.slice(0, 3).map((e) => ({
          name: `${e.student.firstName} ${e.student.lastName}`,
          klass: e.klass.title,
          avg: Number(e.avg.toFixed(2)),
        })),
      },
    };
  } catch (error) {
    console.error("getAcademicReportData error:", error);
    return { status: "error", error: "خطا در محاسبه کارنامه" };
  }
}

export async function getPeriodsForReport() {
  const context = await getCurrentContext();
  if (!context?.schoolId || !context?.academicYearId) return [];

  return prisma.gradePeriod.findMany({
    where: {
      schoolId: context.schoolId,
      academicYearId: context.academicYearId,
      isActive: true,
    },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  });
}
