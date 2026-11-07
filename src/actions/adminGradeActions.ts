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

    const students = enrollments.map((e) => ({
      enrollmentId: e.id,
      studentId: e.student.id,
      firstName: e.student.firstName,
      lastName: e.student.lastName,
      nationalCode: e.student.nationalCode,
      fullName: `${e.student.firstName} ${e.student.lastName}`,
      currentValue:
        gradingType === "NUMERIC"
          ? (gradesMap.get(e.id)?.score ?? "")
          : (gradesMap.get(e.id)?.descriptiveValue ?? ""),
    }));

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
        },
        students,
        gradingType,
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
    });
    if (!gradePeriodLesson)
      return { status: "error" as const, error: "درس در دوره یافت نشد" };

    const isNumericEmpty =
      input.score === null ||
      input.score === undefined ||
      (typeof input.score === "number" && isNaN(input.score));
    const isDescriptiveEmpty =
      input.descriptiveValue === null ||
      input.descriptiveValue === undefined ||
      input.descriptiveValue === "";
    const isEmpty =
      input.score !== undefined ? isNumericEmpty : isDescriptiveEmpty;

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

    const grade = await prisma.grade.upsert({
      where: {
        studentEnrollmentId_gradePeriodLessonId: {
          studentEnrollmentId: input.enrollmentId,
          gradePeriodLessonId: gradePeriodLesson.id,
        },
      },
      update: {
        score: input.score ?? null,
        descriptiveValue: input.descriptiveValue || null,
        lastEditedByUsername: username,
      },
      create: {
        studentEnrollmentId: input.enrollmentId,
        gradePeriodLessonId: gradePeriodLesson.id,
        score: input.score ?? null,
        descriptiveValue: input.descriptiveValue || null,
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
  grades: { nationalCode: string; value: string | number }[];
  gradingType: "NUMERIC" | "DESCRIPTIVE";
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
    });

    if (!gradePeriodLesson) {
      return { status: "error" as const, error: "درس در دوره یافت نشد" };
    }

    const enrollments = await prisma.studentEnrollment.findMany({
      where: { klassId: input.klassId },
      include: { student: { select: { nationalCode: true } } },
    });

    // نرمال‌سازی کد ملی به ۱۰ رقم (حذف ۰های اضافه یا اضافه کردن صفر)
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

      let score: number | null = null;
      let descriptiveValue: string | null = null;

      if (input.gradingType === "NUMERIC") {
        const num = Number(item.value);
        if (isNaN(num) || num < 0 || num > 20) {
          skipped++;
          errors.push(
            `نمره ${item.value} برای کد ملی ${item.nationalCode} نامعتبر است`,
          );
          continue;
        }
        score = num;
      } else {
        descriptiveValue = String(item.value).trim();
        if (
          !["خیلی خوب", "خوب", "قابل قبول", "نیاز به تلاش"].includes(
            descriptiveValue,
          )
        ) {
          skipped++;
          errors.push(
            `مقدار "${descriptiveValue}" برای کد ملی ${item.nationalCode} نامعتبر است`,
          );
          continue;
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
          data: { score, descriptiveValue, lastEditedByUsername: username },
        });
        updated++;
      } else {
        await prisma.grade.create({
          data: {
            studentEnrollmentId: enrollmentId,
            gradePeriodLessonId: gradePeriodLesson.id,
            score,
            descriptiveValue,
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
