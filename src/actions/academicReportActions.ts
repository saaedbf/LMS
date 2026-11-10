"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentContext } from "@/actions/authActions";
import { Prisma } from "@prisma/client";

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
  period: {
    title: string;
    examType: "NORMAL" | "TEST";
  };
  lessons: Array<{
    lessonTitle: string;
    units: number;
    teacherName: string;
    score: number | null;
    descriptiveValue: string | null;
    classRank: number | null;
    gradeRank: number | null;
    classAvg: number;
    answerKey: Prisma.JsonValue | null;
    studentAnswers: Prisma.JsonValue | null;
    questionCount: number | null;
    correctCount: number | null;
    wrongCount: number | null;
    blankCount: number | null;
    percentage: number | null;
    questionRange: string | null;
  }>;
  studentAverage: number;
  classRank: number;
  classSize: number;
  gradeRank: number;
  gradeSize: number;
  top3Class: Array<{ name: string; klass: string; avg: number }>;
  top3Grade: Array<{ name: string; klass: string; avg: number }>;
};

function firstQuestionNumber(range: string | null | undefined): number {
  if (!range) return Number.MAX_SAFE_INTEGER;
  const m = range.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
}

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

    const period = await prisma.gradePeriod.findUnique({
      where: { id: periodId },
    });
    if (!period) return { status: "error", error: "دوره یافت نشد" };
    if (!context.isMaster && context.role !== "MANAGER") {
      if (!period.isVisible) {
        return {
          status: "error",
          error: "این کارنامه برای نمایش در دسترس نیست.",
        };
      }
    }

    const allPeriodLessons = await prisma.gradePeriodLesson.findMany({
      where: { gradePeriodId: periodId },
      include: {
        darsPayeReshteh: {
          include: {
            reshtehTadris: true,
            classCourses: { include: { teacher: true } },
          },
        },
      },
    });

    const studentClassLessons = allPeriodLessons
      .filter((l) => l.klassId === enrollment.klassId)
      .sort((a, b) => {
        const aStart = firstQuestionNumber(a.questionRange);
        const bStart = firstQuestionNumber(b.questionRange);
        if (aStart !== bStart) return aStart - bStart;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    if (studentClassLessons.length === 0) {
      return {
        status: "error",
        error: "هیچ درسی در این دوره برای این کلاس ثبت نشده است.",
      };
    }

    // ⬅️ کلید از جدول جدید
    const payeKey = await prisma.gradePeriodPayeKey.findUnique({
      where: {
        gradePeriodId_payeId: {
          gradePeriodId: periodId,
          payeId: enrollment.payeId,
        },
      },
    });
    const answerKey =
      (payeKey?.answerKey as Record<string, number> | null) ?? null;

    // ⬅️ پاسخ از جدول جدید
    const examAnswer = await prisma.studentExamAnswer.findUnique({
      where: {
        studentEnrollmentId_gradePeriodId_payeId: {
          studentEnrollmentId: enrollmentId,
          gradePeriodId: periodId,
          payeId: enrollment.payeId,
        },
      },
    });
    const studentAnswers =
      (examAnswer?.answers as Record<string, number> | null) ?? null;

    const classEnrollments = await prisma.studentEnrollment.findMany({
      where: { klassId: enrollment.klassId, schoolId, academicYearId },
      include: { student: true },
    });

    const gradeEnrollments = await prisma.studentEnrollment.findMany({
      where: {
        schoolId,
        academicYearId,
        payeId: enrollment.payeId,
        reshtehTahsiliId: enrollment.reshtehTahsiliId,
      },
      include: { student: true, klass: true },
    });

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

    const classAverages = classEnrollments
      .map((e) => ({
        enrollmentId: e.id,
        student: e.student,
        avg: calcAvg(e.id, e.klassId),
      }))
      .sort((a, b) => b.avg - a.avg);

    const gradeAverages = gradeEnrollments
      .map((e) => ({
        enrollmentId: e.id,
        student: e.student,
        klass: e.klass,
        avg: calcAvg(e.id, e.klassId),
      }))
      .sort((a, b) => b.avg - a.avg);

    const lessonsData = studentClassLessons.map((lesson) => {
      const studentGrade = gradeMap.get(`${enrollmentId}_${lesson.id}`);

      const classCourse = lesson.darsPayeReshteh.classCourses.find(
        (cc) => cc.klassId === enrollment.klassId,
      );
      const teacher = classCourse?.teacher;

      const classLessonScores = classEnrollments
        .map((e) => gradeMap.get(`${e.id}_${lesson.id}`)?.score)
        .filter((s) => s !== undefined && s !== null) as number[];

      const gradeLessonScores = gradeEnrollments
        .map((e) => {
          const equivalentLesson = allPeriodLessons.find(
            (pl) =>
              pl.klassId === e.klassId &&
              pl.darsPayeReshtehId === lesson.darsPayeReshtehId,
          );
          if (!equivalentLesson) return null;
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

      const isTest = period.examType === "TEST";
      let percentage: number | null = null;
      if (isTest && studentGrade) {
        const correct = studentGrade.correctCount || 0;
        const wrong = studentGrade.wrongCount || 0;
        const qCount = lesson.questionCount || 1;

        let rawScore = correct;
        if (period.hasNegativeScore) rawScore = correct - wrong / 3;
        if (rawScore < 0) rawScore = 0;

        percentage = (rawScore / qCount) * 100;
      }

      return {
        lessonTitle: lesson.darsPayeReshteh.reshtehTadris.title,
        units: lesson.darsPayeReshteh.units,
        teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : "-",
        score: studentGrade?.score ?? null,
        descriptiveValue: studentGrade?.descriptiveValue ?? null,
        classRank,
        gradeRank,
        classAvg,
        questionCount: isTest ? (lesson.questionCount ?? null) : null,
        correctCount: isTest ? (studentGrade?.correctCount ?? null) : null,
        wrongCount: isTest ? (studentGrade?.wrongCount ?? null) : null,
        blankCount: isTest ? (studentGrade?.blankCount ?? null) : null,
        percentage,
        answerKey,
        studentAnswers,
        questionRange: lesson.questionRange ?? null,
      };
    });

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
        period: {
          title: period.title,
          examType: period.examType,
        },
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
      isVisible: true,
    },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBulkAcademicReports(
  periodId: string,
  klassId: string,
): Promise<
  | { status: "ok"; data: AcademicReportData[] }
  | { status: "error"; error: string }
> {
  const context = await getCurrentContext();
  if (!context?.schoolId || !context?.academicYearId) {
    return { status: "error", error: "کانتکست یافت نشد" };
  }

  const { schoolId, academicYearId } = context;

  try {
    const [period, klassInfo] = await Promise.all([
      prisma.gradePeriod.findUnique({ where: { id: periodId } }),
      prisma.klass.findUnique({
        where: { id: klassId },
        include: {
          paye: true,
          reshtehTahsili: true,
          school: true,
          academicYear: true,
        },
      }),
    ]);

    if (!period || !klassInfo)
      return { status: "error", error: "اطلاعات یافت نشد" };

    const allPeriodLessons = await prisma.gradePeriodLesson.findMany({
      where: { gradePeriodId: periodId },
      include: {
        darsPayeReshteh: {
          include: {
            reshtehTadris: true,
            classCourses: { include: { teacher: true } },
          },
        },
      },
    });

    const studentClassLessons = allPeriodLessons
      .filter((l) => l.klassId === klassId)
      .sort((a, b) => {
        const aStart = firstQuestionNumber(a.questionRange);
        const bStart = firstQuestionNumber(b.questionRange);
        if (aStart !== bStart) return aStart - bStart;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    if (studentClassLessons.length === 0)
      return { status: "error", error: "درسی یافت نشد" };

    // ⬅️ کلید از جدول جدید
    const payeKey = await prisma.gradePeriodPayeKey.findUnique({
      where: {
        gradePeriodId_payeId: {
          gradePeriodId: periodId,
          payeId: klassInfo.payeId,
        },
      },
    });
    const answerKey =
      (payeKey?.answerKey as Record<string, number> | null) ?? null;

    const classEnrollments = await prisma.studentEnrollment.findMany({
      where: { klassId, schoolId, academicYearId },
      include: { student: true },
    });

    const gradeEnrollments = await prisma.studentEnrollment.findMany({
      where: {
        schoolId,
        academicYearId,
        payeId: klassInfo.payeId,
        reshtehTahsiliId: klassInfo.reshtehTahsiliId,
      },
      include: { student: true, klass: true },
    });

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

    // ⬅️ پاسخ‌ها از جدول جدید (برای همه دانش‌آموزان کلاس)
    const examAnswers = await prisma.studentExamAnswer.findMany({
      where: {
        gradePeriodId: periodId,
        payeId: klassInfo.payeId,
        studentEnrollmentId: { in: classEnrollments.map((e) => e.id) },
      },
    });
    const studentAnswersByEnrId = new Map<string, Record<string, number>>();
    for (const ea of examAnswers) {
      if (ea.answers) {
        studentAnswersByEnrId.set(
          ea.studentEnrollmentId,
          ea.answers as Record<string, number>,
        );
      }
    }

    const calcAvg = (enrId: string, enrKlassId: string) => {
      let totalScore = 0;
      let totalUnits = 0;
      const lessons = allPeriodLessons.filter(
        (pl) => pl.klassId === enrKlassId,
      );
      for (const lesson of lessons) {
        const g = gradeMap.get(`${enrId}_${lesson.id}`);
        if (g && g.score !== null) {
          totalScore += g.score * lesson.darsPayeReshteh.units;
          totalUnits += lesson.darsPayeReshteh.units;
        }
      }
      return totalUnits > 0 ? totalScore / totalUnits : 0;
    };

    const classAverages = classEnrollments
      .map((e) => ({
        enrollmentId: e.id,
        student: e.student,
        avg: calcAvg(e.id, e.klassId),
      }))
      .sort((a, b) => b.avg - a.avg);

    const gradeAverages = gradeEnrollments
      .map((e) => ({
        enrollmentId: e.id,
        student: e.student,
        klass: e.klass,
        avg: calcAvg(e.id, e.klassId),
      }))
      .sort((a, b) => b.avg - a.avg);

    const top3Class = classAverages.slice(0, 3).map((e) => ({
      name: `${e.student.firstName} ${e.student.lastName}`,
      klass: klassInfo.title,
      avg: Number(e.avg.toFixed(2)),
    }));

    const top3Grade = gradeAverages.slice(0, 3).map((e) => ({
      name: `${e.student.firstName} ${e.student.lastName}`,
      klass: e.klass.title,
      avg: Number(e.avg.toFixed(2)),
    }));

    const reportsData: AcademicReportData[] = classEnrollments.map(
      (enrollment) => {
        const enrollmentId = enrollment.id;
        const studentAnswers = studentAnswersByEnrId.get(enrollmentId) ?? null;

        const lessonsData = studentClassLessons.map((lesson) => {
          const studentGrade = gradeMap.get(`${enrollmentId}_${lesson.id}`);
          const classCourse = lesson.darsPayeReshteh.classCourses.find(
            (cc) => cc.klassId === klassId,
          );
          const teacher = classCourse?.teacher;

          const classLessonScores = classEnrollments
            .map((e) => gradeMap.get(`${e.id}_${lesson.id}`)?.score)
            .filter((s) => s !== undefined && s !== null) as number[];

          let classRank = null;
          if (studentGrade && studentGrade.score !== null) {
            classRank =
              classLessonScores.filter((s) => s > studentGrade.score!).length +
              1;
          }

          const classAvg =
            classLessonScores.length > 0
              ? classLessonScores.reduce((a, b) => a + b, 0) /
                classLessonScores.length
              : 0;

          const isTest = period.examType === "TEST";
          let percentage: number | null = null;
          if (isTest && studentGrade) {
            const correct = studentGrade.correctCount || 0;
            const wrong = studentGrade.wrongCount || 0;
            const qCount = lesson.questionCount || 1;

            let rawScore = correct;
            if (period.hasNegativeScore) rawScore = correct - wrong / 3;
            if (rawScore < 0) rawScore = 0;

            percentage = (rawScore / qCount) * 100;
          }

          return {
            lessonTitle: lesson.darsPayeReshteh.reshtehTadris.title,
            units: lesson.darsPayeReshteh.units,
            teacherName: teacher
              ? `${teacher.firstName} ${teacher.lastName}`
              : "-",
            score: studentGrade?.score ?? null,
            descriptiveValue: studentGrade?.descriptiveValue ?? null,
            classRank,
            classAvg,
            gradeRank: null,
            questionCount: isTest ? (lesson.questionCount ?? null) : null,
            correctCount: isTest ? (studentGrade?.correctCount ?? null) : null,
            wrongCount: isTest ? (studentGrade?.wrongCount ?? null) : null,
            blankCount: isTest ? (studentGrade?.blankCount ?? null) : null,
            percentage,
            answerKey,
            studentAnswers,
            questionRange: lesson.questionRange ?? null,
          };
        });

        const studentAvg = calcAvg(enrollmentId, klassId);
        const classRank =
          classAverages.findIndex((e) => e.enrollmentId === enrollmentId) + 1;
        const gradeRank =
          gradeAverages.findIndex((e) => e.enrollmentId === enrollmentId) + 1;

        return {
          student: {
            firstName: enrollment.student.firstName,
            lastName: enrollment.student.lastName,
            nationalCode: enrollment.student.nationalCode,
            fatherName: enrollment.student.fatherName,
          },
          school: { title: klassInfo.school.title },
          academicYear: { title: klassInfo.academicYear.title },
          klass: {
            title: klassInfo.title,
            paye: klassInfo.paye.title,
            reshteh: klassInfo.reshtehTahsili.title,
          },
          period: { title: period.title, examType: period.examType },
          lessons: lessonsData,
          studentAverage: studentAvg,
          classRank: classRank > 0 ? classRank : 0,
          classSize: classAverages.length,
          gradeRank: gradeRank > 0 ? gradeRank : 0,
          gradeSize: gradeAverages.length,
          top3Class,
          top3Grade,
        };
      },
    );

    return { status: "ok", data: reportsData };
  } catch (error) {
    console.error("getBulkAcademicReports error:", error);
    return { status: "error", error: "خطا در محاسبه کارنامه‌ها" };
  }
}
