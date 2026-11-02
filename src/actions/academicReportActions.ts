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

    // ۳. تمام درس‌های این دوره برای تمام کلاس‌ها (با واحدها)
    const allPeriodLessons = await prisma.gradePeriodLesson.findMany({
      where: { gradePeriodId: periodId },
      include: {
        darsPayeReshteh: {
          include: {
            reshtehTadris: true,
            classCourses: {
              include: { teacher: true },
            },
          },
        },
      },
    });

    // ۴. درس‌های مخصوص کلاس این دانش‌آموز
    const studentClassLessons = allPeriodLessons.filter(
      (l) => l.klassId === enrollment.klassId,
    );

    if (studentClassLessons.length === 0) {
      return {
        status: "error",
        error: "هیچ درسی در این دوره برای این کلاس ثبت نشده است.",
      };
    }

    // ۵. تمام دانش‌آموزان کلاس
    const classEnrollments = await prisma.studentEnrollment.findMany({
      where: { klassId: enrollment.klassId, schoolId, academicYearId },
      include: { student: true },
    });

    // ۶. تمام دانش‌آموزان پایه
    const gradeEnrollments = await prisma.studentEnrollment.findMany({
      where: {
        schoolId,
        academicYearId,
        payeId: enrollment.payeId,
        reshtehTahsiliId: enrollment.reshtehTahsiliId,
      },
      include: { student: true, klass: true },
    });

    // ۷. گرفتن تمام نمرات مربوط به این دوره برای تمام دانش‌آموزان درگیر
    const allGrades = await prisma.grade.findMany({
      where: {
        gradePeriodLessonId: { in: allPeriodLessons.map((l) => l.id) },
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

    const gradeMap = new Map();
    for (const g of allGrades) {
      gradeMap.set(`${g.studentEnrollmentId}_${g.gradePeriodLessonId}`, g);
    }

    // ⬅️ تابع محاسبه معدل: حالا کلاس دانش‌آموز را چک می‌کند
    const calcAvg = (enrId: string, klassId: string) => {
      let totalScore = 0;
      let totalUnits = 0;

      const lessonsForThisClass = allPeriodLessons.filter(
        (pl) => pl.klassId === klassId,
      );

      for (const lesson of lessonsForThisClass) {
        const g = gradeMap.get(`${enrId}_${lesson.id}`);
        if (g && g.score !== null) {
          const units = lesson.darsPayeReshteh.units || 1;
          totalScore += g.score * units;
          totalUnits += units;
        }
      }
      return totalUnits > 0 ? totalScore / totalUnits : 0;
    };

    // ۸. محاسبه معدل کلاس
    const classAverages = classEnrollments
      .map((e) => ({
        enrollmentId: e.id,
        student: e.student,
        avg: calcAvg(e.id, e.klassId),
      }))
      .sort((a, b) => b.avg - a.avg);

    // ۹. محاسبه معدل پایه (برای هر دانش‌آموز بر اساس کلاس خودش)
    const gradeAverages = gradeEnrollments
      .map((e) => ({
        enrollmentId: e.id,
        student: e.student,
        klass: e.klass,
        avg: calcAvg(e.id, e.klassId),
      }))
      .sort((a, b) => b.avg - a.avg);

    // ۱۰. محاسبه رتبه‌های تک‌تک دروس

    const lessonsData = studentClassLessons.map((lesson) => {
      const studentGrade = gradeMap.get(`${enrollmentId}_${lesson.id}`);

      // پیدا کردن معلم این درس در این کلاس
      const classCourse = lesson.darsPayeReshteh.classCourses.find(
        (cc) => cc.klassId === enrollment.klassId,
      );
      const teacher = classCourse?.teacher;

      // نمرات کلاس: فقط دانش‌آموزان همین کلاس که نمره این درس را دارند
      const classLessonScores = classEnrollments
        .map((e) => gradeMap.get(`${e.id}_${lesson.id}`)?.score)
        .filter((s) => s !== undefined && s !== null) as number[];

      // ⬅️ نمرات پایه: باید دانش‌آموزانی را پیدا کنیم که این درس را در کلاس خودشان دارند
      const gradeLessonScores = gradeEnrollments
        .map((e) => {
          // درس معادل این درس در کلاس دانش‌آموز پایه
          const equivalentLesson = allPeriodLessons.find(
            (pl) =>
              pl.klassId === e.klassId &&
              pl.darsPayeReshtehId === lesson.darsPayeReshtehId,
          );
          if (!equivalentLesson) return null; // اگر این درس را ندارد
          const g = gradeMap.get(`${e.id}_${equivalentLesson.id}`);
          return g?.score ?? null;
        })
        .filter((s) => s !== null) as number[];

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
    const studentAvg = calcAvg(enrollmentId, enrollment.klassId);
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
