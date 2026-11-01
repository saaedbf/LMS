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
    });

    // ۴. نمرات این دانش‌آموز
    const studentGrades = await prisma.grade.findMany({
      where: {
        studentEnrollmentId: enrollmentId,
        gradePeriodLessonId: { in: periodLessons.map((l) => l.id) },
      },
    });
    const gradeMap = new Map(
      studentGrades.map((g) => [g.gradePeriodLessonId, g]),
    );

    // ۵. تمام دانش‌آموزان کلاس (برای محاسبه رتبه و معدل کلاس)
    const classEnrollments = await prisma.studentEnrollment.findMany({
      where: { klassId: enrollment.klassId, schoolId, academicYearId },
      include: { student: true },
    });

    // ۶. تمام دانش‌آموزان پایه (برای رتبه در پایه)
    const gradeEnrollments = await prisma.studentEnrollment.findMany({
      where: {
        schoolId,
        academicYearId,
        payeId: enrollment.payeId,
        reshtehTahsiliId: enrollment.reshtehTahsiliId,
      },
      include: { student: true, klass: true },
    });

    // ۷. توابع محاسبه معدل
    const calcAvg = (grades: any[], lessons: any[]) => {
      let totalScore = 0;
      let totalUnits = 0;
      for (const lesson of lessons) {
        const g = grades.find((x) => x.gradePeriodLessonId === lesson.id);
        if (g && g.score !== null) {
          totalScore += g.score * lesson.darsPayeReshteh.units;
          totalUnits += lesson.darsPayeReshteh.units;
        }
      }
      return totalUnits > 0 ? totalScore / totalUnits : 0;
    };

    // ۸. محاسبه معدل همه دانش‌آموزان کلاس
    const classAverages = await Promise.all(
      classEnrollments.map(async (e) => {
        const grades = await prisma.grade.findMany({
          where: {
            studentEnrollmentId: e.id,
            gradePeriodLessonId: { in: periodLessons.map((l) => l.id) },
          },
        });
        return {
          enrollmentId: e.id,
          student: e.student,
          avg: calcAvg(grades, periodLessons),
        };
      }),
    );
    classAverages.sort((a, b) => b.avg - a.avg);

    // ۹. محاسبه معدل همه دانش‌آموزان پایه
    const gradeAverages = await Promise.all(
      gradeEnrollments.map(async (e) => {
        const grades = await prisma.grade.findMany({
          where: {
            studentEnrollmentId: e.id,
            gradePeriodLessonId: { in: periodLessons.map((l) => l.id) },
          },
        });
        return {
          enrollmentId: e.id,
          student: e.student,
          klass: e.klass,
          avg: calcAvg(grades, periodLessons),
        };
      }),
    );
    gradeAverages.sort((a, b) => b.avg - a.avg);

    // ۱۰. نمرات و رتبه‌های تک‌تک دروس
    const lessonsData = await Promise.all(
      periodLessons.map(async (lesson) => {
        const g = gradeMap.get(lesson.id);
        const teacher = lesson.darsPayeReshteh.classCourses[0]?.teacher;

        // رتبه در کلاس
        const classLessonGrades = classAverages.map(async (e) => {
          const grade = await prisma.grade.findFirst({
            where: {
              studentEnrollmentId: e.enrollmentId,
              gradePeriodLessonId: lesson.id,
            },
          });
          return grade?.score ?? -1;
        });
        const scores = await Promise.all(classLessonGrades);
        scores.sort((a, b) => b - a);
        const classRank = g?.score != null ? scores.indexOf(g.score) + 1 : null;

        // رتبه در پایه
        const gradeLessonGrades = gradeAverages.map(async (e) => {
          const grade = await prisma.grade.findFirst({
            where: {
              studentEnrollmentId: e.enrollmentId,
              gradePeriodLessonId: lesson.id,
            },
          });
          return grade?.score ?? -1;
        });
        const gradeScores = await Promise.all(gradeLessonGrades);
        gradeScores.sort((a, b) => b - a);
        const gradeRank =
          g?.score != null ? gradeScores.indexOf(g.score) + 1 : null;

        // معدل کلاس در این درس
        const validScores = scores.filter((s) => s >= 0);
        const classAvg =
          validScores.length > 0
            ? validScores.reduce((a, b) => a + b, 0) / validScores.length
            : 0;

        return {
          lessonTitle: lesson.darsPayeReshteh.reshtehTadris.title,
          units: lesson.darsPayeReshteh.units,
          teacherName: teacher
            ? `${teacher.firstName} ${teacher.lastName}`
            : "-",
          score: g?.score ?? null,
          descriptiveValue: g?.descriptiveValue ?? null,
          classRank,
          gradeRank,
          classAvg,
        };
      }),
    );

    // ۱۱. معدل و رتبه خود دانش‌آموز
    const studentAvg = calcAvg(studentGrades, periodLessons);
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
        classRank,
        classSize: classAverages.length,
        gradeRank,
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
// در actions/academicReportActions.ts اضافه کنید:
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
