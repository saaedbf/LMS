"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentContext } from "@/actions/authActions";
import { revalidatePath } from "next/cache";

// ۱. گرفتن لیست دانش‌آموزان برای مدیر
export async function getStudentsForAdminGrading(
  periodId: string,
  klassId: string,
  lessonId: string,
) {
  const context = await getCurrentContext();
  // فقط چک می‌کنیم مدیر باشد (یا Master)
  if (!context?.user || (context.role !== "MANAGER" && !context.isMaster)) {
    return { status: "error" as const, error: "دسترسی غیرمجاز" };
  }

  try {
    const klass = await prisma.klass.findUnique({
      where: { id: klassId },
      include: {
        paye: true,
        reshtehTahsili: true,
      },
    });

    if (!klass) return { status: "error" as const, error: "کلاس یافت نشد" };

    const lesson = await prisma.darsPayeReshteh.findUnique({
      where: { id: lessonId },
      include: { reshtehTadris: true },
    });

    if (!lesson) return { status: "error" as const, error: "درس یافت نشد" };

    const gradePeriodLesson = await prisma.gradePeriodLesson.findFirst({
      where: { gradePeriodId: periodId, darsPayeReshtehId: lessonId, klassId },

      include: {
        gradePeriod: true,
      },
    });

    if (!gradePeriodLesson) {
      return { status: "error" as const, error: "این درس در این دوره نیست" };
    }

    const settings = await prisma.schoolSettings.findUnique({
      where: { schoolId: klass.schoolId },
    });

    const gradingType = settings?.gradingType || "NUMERIC";

    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        klassId,
        schoolId: klass.schoolId,
        academicYearId: klass.academicYearId,
      },
      include: { student: true },
      orderBy: [
        { student: { lastName: "asc" } },
        { student: { firstName: "asc" } },
      ],
    });

    const grades = await prisma.grade.findMany({
      where: {
        gradePeriodLessonId: gradePeriodLesson.id,
        studentEnrollmentId: { in: enrollments.map((e) => e.id) },
      },
    });

    const gradesMap = new Map(grades.map((g) => [g.studentEnrollmentId, g]));

    const students = enrollments.map((e) => {
      const grade = gradesMap.get(e.id);
      return {
        enrollmentId: e.id,
        studentId: e.student.id,
        firstName: e.student.firstName,
        lastName: e.student.lastName,
        nationalCode: e.student.nationalCode,
        fullName: `${e.student.firstName} ${e.student.lastName}`,

        // مقدار عادی
        currentValue:
          gradingType === "NUMERIC"
            ? (grade?.score ?? "")
            : (grade?.descriptiveValue ?? ""),

        // ⬅️ فیلدهای تستی
        correctCount: grade?.correctCount ?? null,
        wrongCount: grade?.wrongCount ?? null,
        blankCount: grade?.blankCount ?? null,
      };
    });

    return {
      status: "success" as const,
      data: {
        klass: {
          id: klass.id,
          title: klass.title,
          paye: klass.paye.title,
          reshtehTahsili: klass.reshtehTahsili.title,
        },
        lesson: {
          id: lesson.id,
          title: lesson.reshtehTadris.title,
          units: lesson.units,
          questionCount: gradePeriodLesson?.questionCount ?? null, // ⬅️ اضافه شد
        },
        students,
        gradingType,
        // ⬅️ اطلاعات آزمون برای استفاده در فرم
        isTest: gradePeriodLesson?.gradePeriod?.examType === "TEST",
        hasNegativeScore:
          gradePeriodLesson?.gradePeriod?.hasNegativeScore ?? false,
      },
    };
  } catch (error) {
    console.error("getStudentsForAdminGrading error:", error);
    return { status: "error" as const, error: "خطا در دریافت دانش‌آموزان" };
  }
}

// ۲. ذخیره نمره توسط مدیر
export async function saveGradeByAdmin(input: {
  enrollmentId: string;
  darsPayeReshtehId: string;
  periodId: string;
  score: number | null;
  descriptiveValue?: string | null;
  correctCount?: number | null;
  wrongCount?: number | null;
  blankCount?: number | null;
}) {
  const context = await getCurrentContext();
  if (!context?.user || (context.role !== "MANAGER" && !context.isMaster)) {
    return { status: "error" as const, error: "دسترسی غیرمجاز" };
  }

  const username = context.user.email || context.user.name || "manager";

  try {
    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { id: input.enrollmentId },
      select: { klassId: true },
    });
    if (!enrollment)
      return { status: "error" as const, error: "دانش‌آموز یافت نشد" };

    const gradePeriodLesson = await prisma.gradePeriodLesson.findFirst({
      where: {
        gradePeriodId: input.periodId,
        darsPayeReshtehId: input.darsPayeReshtehId,
        klassId: enrollment.klassId,
      },
      include: { gradePeriod: true },
    });
    if (!gradePeriodLesson)
      return { status: "error" as const, error: "درس در دوره یافت نشد" };

    const isTest = gradePeriodLesson.gradePeriod.examType === "TEST";

    // ⬅️ منطق خالی بودن بر اساس نوع آزمون
    let isEmpty = false;
    if (isTest) {
      // اگر هر سه فیلد تستی صفر یا خالی بودند
      isEmpty =
        (input.correctCount === null || input.correctCount === undefined) &&
        (input.wrongCount === null || input.wrongCount === undefined) &&
        (input.blankCount === null || input.blankCount === undefined);
    } else {
      const isNumericEmpty =
        input.score === null ||
        input.score === undefined ||
        (typeof input.score === "number" && isNaN(input.score));
      const isDescriptiveEmpty =
        input.descriptiveValue === null ||
        input.descriptiveValue === undefined ||
        input.descriptiveValue === "";
      isEmpty = input.score !== undefined ? isNumericEmpty : isDescriptiveEmpty;
    }

    // حذف نمره در صورت خالی بودن
    if (isEmpty) {
      await prisma.grade.deleteMany({
        where: {
          studentEnrollmentId: input.enrollmentId,
          gradePeriodLessonId: gradePeriodLesson.id,
        },
      });
      revalidatePath("/dashboard/manager/grade-periods");
      return { status: "success" as const, data: { message: "نمره حذف شد" } };
    }

    // ⬅️ محاسبه نمره نهایی برای آزمون تستی
    let finalScore = input.score;

    if (isTest) {
      const correct = input.correctCount || 0;
      const wrong = input.wrongCount || 0;
      const questionCount = gradePeriodLesson.questionCount || 1;
      const hasNegative = gradePeriodLesson.gradePeriod.hasNegativeScore;

      let rawScore = correct;
      if (hasNegative) {
        rawScore = correct - wrong / 3;
      }

      // جلوگیری از منفی شدن
      if (rawScore < 0) rawScore = 0;

      const percentage = (rawScore / questionCount) * 100;
      finalScore = Math.min((percentage / 100) * 20, 20); // نهایتاً ۲۰
    }

    const grade = await prisma.grade.upsert({
      where: {
        studentEnrollmentId_gradePeriodLessonId: {
          studentEnrollmentId: input.enrollmentId,
          gradePeriodLessonId: gradePeriodLesson.id,
        },
      },
      update: {
        score: finalScore ?? null,
        descriptiveValue: input.descriptiveValue || null,
        // ⬅️ ذخیره فیلدهای تستی
        correctCount: input.correctCount ?? null,
        wrongCount: input.wrongCount ?? null,
        blankCount: input.blankCount ?? null,
        lastEditedByUsername: username,
      },
      create: {
        studentEnrollmentId: input.enrollmentId,
        gradePeriodLessonId: gradePeriodLesson.id,
        score: finalScore ?? null,
        descriptiveValue: input.descriptiveValue || null,
        // ⬅️ ذخیره فیلدهای تستی
        correctCount: input.correctCount ?? null,
        wrongCount: input.wrongCount ?? null,
        blankCount: input.blankCount ?? null,
        lastEditedByUsername: username,
      },
    });

    revalidatePath("/dashboard/manager/grade-periods");
    return { status: "success" as const, data: { gradeId: grade.id } };
  } catch (err) {
    console.error("saveGradeByAdmin error:", err);
    return { status: "error" as const, error: "خطا در ثبت نمره" };
  }
}
export async function bulkSaveGradesByAdmin(input: {
  periodId: string;
  lessonId: string;
  klassId: string;
  grades: {
    nationalCode: string;
    value?: string | number;
    correctCount?: number;
    wrongCount?: number;
    blankCount?: number;
  }[];
  gradingType: "NUMERIC" | "DESCRIPTIVE";
  isTest?: boolean;
  questionCount?: number;
}) {
  const context = await getCurrentContext();
  if (!context?.user || (context.role !== "MANAGER" && !context.isMaster)) {
    return { status: "error" as const, error: "دسترسی غیرمجاز" };
  }

  const username = context.user.email || context.user.name || "manager";
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  try {
    const gradePeriodLesson = await prisma.gradePeriodLesson.findFirst({
      where: {
        gradePeriodId: input.periodId,
        darsPayeReshtehId: input.lessonId,
        klassId: input.klassId,
      },
      include: { gradePeriod: true },
    });

    if (!gradePeriodLesson) {
      return { status: "error" as const, error: "درس در دوره یافت نشد" };
    }

    const isTest = gradePeriodLesson.gradePeriod.examType === "TEST";
    const hasNegative = gradePeriodLesson.gradePeriod.hasNegativeScore;
    const qCount = gradePeriodLesson.questionCount || 1;

    const enrollments = await prisma.studentEnrollment.findMany({
      where: { klassId: input.klassId },
      include: { student: { select: { nationalCode: true } } },
    });

    const enrollmentMap = new Map(
      enrollments.map((e) => {
        let code = e.student.nationalCode.replace(/\D/g, "");
        if (code.length === 8) code = "00" + code;
        else if (code.length === 9) code = "0" + code;
        return [code, e.id];
      }),
    );

    for (const item of input.grades) {
      let cleanCode = String(item.nationalCode).replace(/\D/g, "");
      if (cleanCode.length === 8) cleanCode = "00" + cleanCode;
      else if (cleanCode.length === 9) cleanCode = "0" + cleanCode;

      const enrollmentId = enrollmentMap.get(cleanCode);

      if (!enrollmentId) {
        skipped++;
        errors.push(`کد ملی ${item.nationalCode} در این کلاس یافت نشد`);
        continue;
      }

      let finalScore: number | null = null;
      let descriptiveValue: string | null = null;
      let correctCount: number | null = null;
      let wrongCount: number | null = null;
      let blankCount: number | null = null;

      if (isTest) {
        // ⬅️ محاسبه نمره برای حالت تستی
        const correct = item.correctCount || 0;
        const wrong = item.wrongCount || 0;
        const blank = item.blankCount || 0;

        correctCount = correct;
        wrongCount = wrong;
        blankCount = blank;

        let rawScore = correct;
        if (hasNegative) rawScore = correct - wrong / 3;
        if (rawScore < 0) rawScore = 0;

        const percentage = (rawScore / qCount) * 100;
        finalScore = Math.min((percentage / 100) * 20, 20);
      } else {
        // حالت عادی
        if (input.gradingType === "NUMERIC") {
          const num = Number(item.value);
          if (isNaN(num) || num < 0 || num > 20) {
            skipped++;
            errors.push(
              `نمره ${item.value} برای کد ملی ${item.nationalCode} نامعتبر است`,
            );
            continue;
          }
          finalScore = num;
        } else {
          descriptiveValue = String(item.value).trim();
        }
      }

      const existing = await prisma.grade.findUnique({
        where: {
          studentEnrollmentId_gradePeriodLessonId: {
            studentEnrollmentId: enrollmentId,
            gradePeriodLessonId: gradePeriodLesson.id,
          },
        },
      });

      if (existing) {
        await prisma.grade.update({
          where: { id: existing.id },
          data: {
            score: finalScore,
            descriptiveValue,
            correctCount,
            wrongCount,
            blankCount,
            lastEditedByUsername: username,
          },
        });
        updated++;
      } else {
        await prisma.grade.create({
          data: {
            studentEnrollmentId: enrollmentId,
            gradePeriodLessonId: gradePeriodLesson.id,
            score: finalScore,
            descriptiveValue,
            correctCount,
            wrongCount,
            blankCount,
            lastEditedByUsername: username,
          },
        });
        created++;
      }
    }

    revalidatePath("/dashboard/manager/grade-periods");
    return {
      status: "success" as const,
      data: { created, updated, skipped, errors },
    };
  } catch (err: any) {
    console.error("bulkSaveGradesByAdmin error:", err);
    return { status: "error" as const, error: "خطا در ثبت گروهی نمرات" };
  }
}
export async function bulkSaveSameGradeByAdmin(input: {
  periodId: string;
  lessonId: string;
  klassId: string;
  value: string | number;
  gradingType: "NUMERIC" | "DESCRIPTIVE";
}) {
  const context = await getCurrentContext();
  if (!context?.user || (context.role !== "MANAGER" && !context.isMaster)) {
    return { status: "error" as const, error: "دسترسی غیرمجاز" };
  }

  const username = context.user.email || context.user.name || "manager";

  try {
    const gradePeriodLesson = await prisma.gradePeriodLesson.findFirst({
      where: {
        gradePeriodId: input.periodId,
        darsPayeReshtehId: input.lessonId,
        klassId: input.klassId,
      },
    });

    if (!gradePeriodLesson) {
      return { status: "error" as const, error: "درس در این دوره یافت نشد" };
    }

    const enrollments = await prisma.studentEnrollment.findMany({
      where: { klassId: input.klassId },
      select: { id: true },
    });

    if (enrollments.length === 0) {
      return { status: "error" as const, error: "دانش‌آموزی در این کلاس نیست" };
    }

    let score: number | null = null;
    let descriptiveValue: string | null = null;

    if (input.gradingType === "NUMERIC") {
      const num = Number(input.value);
      if (isNaN(num) || num < 0 || num > 20) {
        return {
          status: "error" as const,
          error: "نمره باید بین ۰ تا ۲۰ باشد",
        };
      }
      score = num;
    } else {
      descriptiveValue = String(input.value).trim();
    }

    const result = await prisma.$transaction(async (tx) => {
      let created = 0;
      let updated = 0;

      for (const enr of enrollments) {
        const existing = await tx.grade.findUnique({
          where: {
            studentEnrollmentId_gradePeriodLessonId: {
              studentEnrollmentId: enr.id,
              gradePeriodLessonId: gradePeriodLesson.id,
            },
          },
        });

        if (existing) {
          await tx.grade.update({
            where: { id: existing.id },
            data: { score, descriptiveValue, lastEditedByUsername: username },
          });
          updated++;
        } else {
          await tx.grade.create({
            data: {
              studentEnrollmentId: enr.id,
              gradePeriodLessonId: gradePeriodLesson.id,
              score,
              descriptiveValue,
              lastEditedByUsername: username,
            },
          });
          created++;
        }
      }

      return { created, updated };
    });

    revalidatePath("/dashboard/manager/grade-periods");
    return { status: "success" as const, data: result };
  } catch (err) {
    console.error("bulkSaveSameGradeByAdmin error:", err);
    return { status: "error" as const, error: "خطا در ثبت گروهی نمره" };
  }
}
export async function bulkSaveGradesByPayeByAdmin(input: {
  periodId: string;
  payeId: number;
  darsPayeReshtehId: string;
  grades: {
    nationalCode: string;
    value?: string | number;
    correctCount?: number;
    wrongCount?: number;
    blankCount?: number;
  }[];
  gradingType: "NUMERIC" | "DESCRIPTIVE";
}) {
  const context = await getCurrentContext();
  if (!context?.user || (context.role !== "MANAGER" && !context.isMaster)) {
    return { status: "error" as const, error: "دسترسی غیرمجاز" };
  }

  const username = context.user.email || context.user.name || "manager";

  try {
    // پیدا کردن تمام کلاس‌های این پایه که درس مورد نظر را در این دوره دارند
    const gradePeriodLessons = await prisma.gradePeriodLesson.findMany({
      where: {
        gradePeriodId: input.periodId,
        darsPayeReshtehId: input.darsPayeReshtehId,
        darsPayeReshteh: { payeId: input.payeId },
      },
      include: { gradePeriod: true },
    });

    if (gradePeriodLessons.length === 0) {
      return {
        status: "error" as const,
        error: "این درس در این دوره برای این پایه یافت نشد",
      };
    }

    const isTest = gradePeriodLessons[0].gradePeriod.examType === "TEST";
    const hasNegative = gradePeriodLessons[0].gradePeriod.hasNegativeScore;
    const qCount = gradePeriodLessons[0].questionCount || 1;

    // گرفتن تمام دانش‌آموزان این پایه
    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        payeId: input.payeId,
        schoolId: gradePeriodLessons[0].gradePeriod.schoolId,
        academicYearId: gradePeriodLessons[0].gradePeriod.academicYearId,
        klassId: { in: gradePeriodLessons.map((gpl) => gpl.klassId) },
      },
      include: { student: { select: { nationalCode: true } } },
    });

    // نگاشت کد ملی به enrollmentId
    const enrollmentMap = new Map(
      enrollments.map((e) => {
        let code = e.student.nationalCode.replace(/\D/g, "");
        if (code.length === 8) code = "00" + code;
        else if (code.length === 9) code = "0" + code;
        return [code, e.id];
      }),
    );

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const item of input.grades) {
      let cleanCode = String(item.nationalCode).replace(/\D/g, "");
      if (cleanCode.length === 8) cleanCode = "00" + cleanCode;
      else if (cleanCode.length === 9) cleanCode = "0" + cleanCode;

      const enrollmentId = enrollmentMap.get(cleanCode);

      if (!enrollmentId) {
        skipped++;
        errors.push(`کد ملی ${item.nationalCode} در این پایه یافت نشد`);
        continue;
      }

      const enrollment = enrollments.find((e) => e.id === enrollmentId);
      if (!enrollment) continue;

      // پیدا کردن رکورد درس مربوط به کلاس این دانش‌آموز
      const gradePeriodLesson = gradePeriodLessons.find(
        (gpl) => gpl.klassId === enrollment.klassId,
      );
      if (!gradePeriodLesson) {
        skipped++;
        errors.push(
          `درس برای کلاس دانش‌آموز با کد ملی ${item.nationalCode} تعریف نشده است`,
        );
        continue;
      }

      let finalScore: number | null = null;
      let descriptiveValue: string | null = null;
      let correctCount: number | null = null;
      let wrongCount: number | null = null;
      let blankCount: number | null = null;

      if (isTest) {
        const correct = item.correctCount || 0;
        const wrong = item.wrongCount || 0;
        const blank = item.blankCount || 0;

        correctCount = correct;
        wrongCount = wrong;
        blankCount = blank;

        let rawScore = correct;
        if (hasNegative) rawScore = correct - wrong / 3;
        if (rawScore < 0) rawScore = 0;

        const percentage = (rawScore / qCount) * 100;
        finalScore = Math.min((percentage / 100) * 20, 20);
      } else {
        if (input.gradingType === "NUMERIC") {
          const num = Number(item.value);
          if (isNaN(num) || num < 0 || num > 20) {
            skipped++;
            errors.push(
              `نمره ${item.value} برای کد ملی ${item.nationalCode} نامعتبر است`,
            );
            continue;
          }
          finalScore = num;
        } else {
          descriptiveValue = String(item.value).trim();
        }
      }

      const existing = await prisma.grade.findUnique({
        where: {
          studentEnrollmentId_gradePeriodLessonId: {
            studentEnrollmentId: enrollmentId,
            gradePeriodLessonId: gradePeriodLesson.id,
          },
        },
      });

      if (existing) {
        await prisma.grade.update({
          where: { id: existing.id },
          data: {
            score: finalScore,
            descriptiveValue,
            correctCount,
            wrongCount,
            blankCount,
            lastEditedByUsername: username,
          },
        });
        updated++;
      } else {
        await prisma.grade.create({
          data: {
            studentEnrollmentId: enrollmentId,
            gradePeriodLessonId: gradePeriodLesson.id,
            score: finalScore,
            descriptiveValue,
            correctCount,
            wrongCount,
            blankCount,
            lastEditedByUsername: username,
          },
        });
        created++;
      }
    }

    revalidatePath("/dashboard/manager/grade-periods");
    return {
      status: "success" as const,
      data: { created, updated, skipped, errors },
    };
  } catch (err) {
    console.error("bulkSaveGradesByPayeByAdmin error:", err);
    return { status: "error" as const, error: "خطا در ثبت گروهی نمرات" };
  }
}
export async function getPayesAndLessonsForAdmin(periodId: string) {
  const context = await getCurrentContext();
  if (!context?.user || (context.role !== "MANAGER" && !context.isMaster)) {
    return { status: "error" as const, error: "دسترسی غیرمجاز" };
  }

  const lessons = await prisma.gradePeriodLesson.findMany({
    where: { gradePeriodId: periodId },
    include: {
      darsPayeReshteh: {
        include: { paye: true, reshtehTadris: true },
      },
    },
  });

  const payeMap = new Map<number, any>();
  for (const l of lessons) {
    const payeId = l.darsPayeReshteh.payeId;
    if (!payeMap.has(payeId)) {
      payeMap.set(payeId, {
        payeId,
        payeTitle: l.darsPayeReshteh.paye.title,
        lessons: [],
      });
    }
    const entry = payeMap.get(payeId)!;
    if (!entry.lessons.find((x: any) => x.id === l.darsPayeReshtehId)) {
      entry.lessons.push({
        id: l.darsPayeReshtehId,
        title: l.darsPayeReshteh.reshtehTadris.title,
      });
    }
  }

  return { status: "success" as const, data: Array.from(payeMap.values()) };
}
