"use server";

import { prisma } from "@/lib/prisma";
import { getScope } from "@/lib/auth-helpers";
import { isScopeError } from "@/lib/auth-helpers-utils";
import { PERMISSIONS } from "@/lib/permissions";
import {
  createStudentEnrollmentSchema,
  updateStudentEnrollmentSchema,
} from "@/lib/schemas/student";
import { revalidatePath } from "next/cache";

type ActionSuccess<T> = { status: "success"; data: T };
type ActionError = { status: "error"; error: string };

type EnrollmentItem = {
  id: string;
  studentId: string;
  schoolId: number;
  academicYearId: number;
  payeId: number;
  reshtehTahsiliId: number;
  klassId: string;
  school?: {
    id: number;
    title?: string | null;
    name?: string | null;
  } | null;
  academicYear?: {
    id: number;
    title?: string | null;
    name?: string | null;
    year?: string | null;
  } | null;
  paye?: {
    id: number;
    title?: string | null;
    name?: string | null;
  } | null;
  reshtehTahsili?: {
    id: number;
    title?: string | null;
    name?: string | null;
  } | null;
  klass?: {
    id: string;
    title?: string | null;
    name?: string | null;
    className?: string | null;
    klassName?: string | null;
  } | null;
};

function success<T>(data: T): ActionSuccess<T> {
  return { status: "success", data };
}

function error(message: string): ActionError {
  return { status: "error", error: message };
}

function mapEnrollment(enrollment: any): EnrollmentItem {
  return {
    id: enrollment.id,
    studentId: enrollment.studentId,
    schoolId: enrollment.schoolId,
    academicYearId: enrollment.academicYearId,
    payeId: enrollment.payeId,
    reshtehTahsiliId: enrollment.reshtehTahsiliId,
    klassId: enrollment.klassId,
    school: enrollment.school
      ? {
          id: enrollment.school.id,
          title: enrollment.school.title ?? null,
          name: enrollment.school.name ?? null,
        }
      : null,
    academicYear: enrollment.academicYear
      ? {
          id: enrollment.academicYear.id,
          title: enrollment.academicYear.title ?? null,
          name: enrollment.academicYear.name ?? null,
          year: enrollment.academicYear.year ?? null,
        }
      : null,
    paye: enrollment.paye
      ? {
          id: enrollment.paye.id,
          title: enrollment.paye.title ?? null,
          name: enrollment.paye.name ?? null,
        }
      : null,
    reshtehTahsili: enrollment.reshtehTahsili
      ? {
          id: enrollment.reshtehTahsili.id,
          title: enrollment.reshtehTahsili.title ?? null,
          name: enrollment.reshtehTahsili.name ?? null,
        }
      : null,
    klass: enrollment.klass
      ? {
          id: enrollment.klass.id,
          title: enrollment.klass.title ?? null,
          name: enrollment.klass.name ?? null,
          className: enrollment.klass.className ?? null,
          klassName: enrollment.klass.klassName ?? null,
        }
      : null,
  };
}

async function validateKlassMatchesEnrollment(params: {
  klassId: string;
  schoolId: number;
  academicYearId: number;
  payeId: number;
  reshtehTahsiliId: number;
}) {
  const klass = await prisma.klass.findUnique({
    where: { id: params.klassId },
    select: {
      id: true,
      schoolId: true,
      academicYearId: true,
      payeId: true,
      reshtehTahsiliId: true,
    },
  });

  if (!klass) {
    return { ok: false, message: "کلاس انتخاب‌شده پیدا نشد." } as const;
  }

  if (
    klass.schoolId !== params.schoolId ||
    klass.academicYearId !== params.academicYearId ||
    klass.payeId !== params.payeId ||
    klass.reshtehTahsiliId !== params.reshtehTahsiliId
  ) {
    return {
      ok: false,
      message:
        "کلاس انتخاب‌شده با مدرسه، سال تحصیلی، پایه و رشته انتخاب‌شده مطابقت ندارد.",
    } as const;
  }

  return { ok: true, klass } as const;
}

export async function createStudentEnrollment(input: unknown) {
  const parsed = createStudentEnrollmentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error" as const,
      error: parsed.error.issues[0]?.message,
    };
  }

  const scope = await getScope(PERMISSIONS.MANAGE_STUDENTS);
  if (isScopeError(scope)) {
    return { status: "error" as const, error: scope.error };
  }

  const enrollment = await prisma.studentEnrollment.create({
    data: {
      studentId: parsed.data.studentId,
      schoolId: parsed.data.schoolId,
      academicYearId: parsed.data.academicYearId,
      payeId: parsed.data.payeId,
      reshtehTahsiliId: parsed.data.reshtehTahsiliId,
      klassId: parsed.data.klassId,
    },
  });

  revalidatePath("/dashboard/manager/students");
  return { status: "success" as const, data: enrollment };
}

export async function updateStudentEnrollment(
  input: unknown,
): Promise<ActionSuccess<EnrollmentItem> | ActionError> {
  const parsed = updateStudentEnrollmentSchema.safeParse(input);
  if (!parsed.success) {
    return error(
      parsed.error.issues[0]?.message ?? "اطلاعات ویرایش ثبت‌نام نامعتبر است.",
    );
  }

  const scope = await getScope(PERMISSIONS.MANAGE_STUDENTS);
  if (isScopeError(scope)) return error(scope.error);

  const currentUsername = scope.username;

  try {
    const existingEnrollment = await prisma.studentEnrollment.findUnique({
      where: { id: parsed.data.enrollmentId },
      select: { id: true, schoolId: true, academicYearId: true },
    });

    if (!existingEnrollment) {
      return error("ثبت‌نام موردنظر پیدا نشد.");
    }

    const klassCheck = await validateKlassMatchesEnrollment({
      klassId: parsed.data.klassId,
      schoolId: existingEnrollment.schoolId,
      academicYearId: existingEnrollment.academicYearId,
      payeId: parsed.data.payeId,
      reshtehTahsiliId: parsed.data.reshtehTahsiliId,
    });

    if (!klassCheck.ok) {
      return error(klassCheck.message);
    }

    const updatedEnrollment = await prisma.studentEnrollment.update({
      where: { id: parsed.data.enrollmentId },
      data: {
        payeId: parsed.data.payeId,
        reshtehTahsiliId: parsed.data.reshtehTahsiliId,
        klassId: parsed.data.klassId,
        lastEditedByUsername: currentUsername,
      },
      include: {
        school: true,
        academicYear: true,
        paye: true,
        reshtehTahsili: true,
        klass: true,
      },
    });

    return success(mapEnrollment(updatedEnrollment));
  } catch (err) {
    return error("خطا در ویرایش ثبت‌نام دانش‌آموز.");
  }
}

export async function getSchoolStudentEnrollments(
  schoolId: number,
  academicYearId: number,
): Promise<ActionSuccess<EnrollmentItem[]> | ActionError> {
  const scope = await getScope(PERMISSIONS.MANAGE_STUDENTS);
  if (isScopeError(scope)) return error(scope.error);

  if (!schoolId || !academicYearId) {
    return error("شناسه مدرسه یا سال تحصیلی نامعتبر است.");
  }

  try {
    const enrollments = await prisma.studentEnrollment.findMany({
      where: { schoolId, academicYearId },
      include: {
        student: true,
        school: true,
        academicYear: true,
        paye: true,
        reshtehTahsili: true,
        klass: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return success(enrollments.map(mapEnrollment));
  } catch (err) {
    return error("خطا در دریافت ثبت‌نام‌های مدرسه.");
  }
}

export async function getStudentEnrollmentById(
  enrollmentId: string,
): Promise<ActionSuccess<EnrollmentItem> | ActionError> {
  const scope = await getScope(PERMISSIONS.MANAGE_STUDENTS);
  if (isScopeError(scope)) return error(scope.error);

  if (!enrollmentId) {
    return error("شناسه ثبت‌نام نامعتبر است.");
  }

  try {
    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: true,
        school: true,
        academicYear: true,
        paye: true,
        reshtehTahsili: true,
        klass: true,
      },
    });

    if (!enrollment) {
      return error("ثبت‌نام پیدا نشد.");
    }

    return success(mapEnrollment(enrollment));
  } catch (err) {
    return error("خطا در دریافت ثبت‌نام.");
  }
}

export async function deleteStudentEnrollment(enrollmentId: string) {
  try {
    const scope = await getScope(PERMISSIONS.MANAGE_STUDENTS);
    if (isScopeError(scope)) {
      return { status: "error" as const, error: scope.error };
    }

    const enrollment = await prisma.studentEnrollment.findFirst({
      where: {
        id: enrollmentId,
        schoolId: scope.schoolId,
        academicYearId: scope.academicYearId,
      },
    });

    if (!enrollment) {
      return { status: "error" as const, error: "ثبت‌نام یافت نشد" };
    }

    await prisma.studentEnrollment.delete({
      where: { id: enrollmentId },
    });

    revalidatePath("/dashboard/manager/students");

    return {
      status: "success" as const,
      data: { id: enrollmentId },
    };
  } catch (error) {
    console.error("DELETE_ENROLLMENT_ERROR", error);
    return { status: "error" as const, error: "خطا در حذف ثبت‌نام" };
  }
}

type ActionResult<T> =
  | { status: "success"; data: T }
  | { status: "error"; error: string };

/**
 * انتقال دانش‌آموز به نوبت مخالف
 * تمام غیبت‌ها، موارد انضباطی، نمرات و تراکنش‌های مالی
 * به ثبت‌نام جدید منتقل می‌شوند.
 */
export async function transferStudentToOppositeShift(
  enrollmentId: string,
  targetKlassId: string,
): Promise<ActionResult<{ direction: "toOpposite" | "backToOriginal" }>> {
  const scope = await getScope(PERMISSIONS.MANAGE_STUDENTS);
  if (isScopeError(scope)) return { status: "error", error: scope.error };

  const { schoolId, academicYearId, username } = scope;

  try {
    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        school: { select: { id: true, oppositeSchoolId: true } },
      },
    });

    if (!enrollment) {
      return { status: "error", error: "ثبت‌نام یافت نشد" };
    }

    if (enrollment.schoolId !== schoolId) {
      return {
        status: "error",
        error: "این ثبت‌نام متعلق به مدرسه فعال شما نیست",
      };
    }

    if (enrollment.academicYearId !== academicYearId) {
      return {
        status: "error",
        error: "این ثبت‌نام متعلق به سال تحصیلی فعال نیست",
      };
    }

    const oppositeSchoolId = enrollment.school.oppositeSchoolId;
    if (!oppositeSchoolId) {
      return {
        status: "error",
        error: "برای این مدرسه نوبت مخالف تعریف نشده است",
      };
    }

    const targetKlass = await prisma.klass.findUnique({
      where: { id: targetKlassId },
    });

    if (!targetKlass) {
      return { status: "error", error: "کلاس مقصد یافت نشد" };
    }

    if (targetKlass.schoolId !== oppositeSchoolId) {
      return { status: "error", error: "کلاس مقصد متعلق به نوبت مخالف نیست" };
    }

    if (targetKlass.academicYearId !== academicYearId) {
      return { status: "error", error: "کلاس مقصد در سال تحصیلی جاری نیست" };
    }

    // ⬅️ جهت انتقال
    const direction =
      enrollment.schoolId === oppositeSchoolId
        ? "backToOriginal"
        : "toOpposite";

    await prisma.$transaction(async (tx) => {
      // ۱. انتقال نمرات به GradePeriodLesson کلاس مقصد
      const oldGrades = await tx.grade.findMany({
        where: { studentEnrollmentId: enrollmentId },
        include: {
          gradePeriodLesson: {
            select: {
              gradePeriodId: true,
              darsPayeReshtehId: true,
            },
          },
        },
      });

      for (const grade of oldGrades) {
        const newLesson = await tx.gradePeriodLesson.findUnique({
          where: {
            gradePeriodId_darsPayeReshtehId_klassId: {
              gradePeriodId: grade.gradePeriodLesson.gradePeriodId,
              darsPayeReshtehId: grade.gradePeriodLesson.darsPayeReshtehId,
              klassId: targetKlassId,
            },
          },
        });

        if (newLesson) {
          await tx.grade.update({
            where: { id: grade.id },
            data: {
              gradePeriodLessonId: newLesson.id,
              lastEditedByUsername: username,
            },
          });
        }
      }

      // ۲. تغییر schoolId و کلاس
      await tx.studentEnrollment.update({
        where: { id: enrollmentId },
        data: {
          schoolId: oppositeSchoolId,
          klassId: targetKlassId,
          payeId: targetKlass.payeId,
          reshtehTahsiliId: targetKlass.reshtehTahsiliId,
          lastEditedByUsername: username,
        },
      });

      // ۳. به‌روزرسانی UserAssignment دانش‌آموز
      const student = await tx.student.findUnique({
        where: { id: enrollment.studentId },
        select: { nationalCode: true },
      });

      if (student) {
        const studentEmail = `${student.nationalCode}@lms.local`.toLowerCase();
        const user = await tx.user.findUnique({
          where: { email: studentEmail },
          select: { id: true },
        });

        if (user) {
          await tx.userAssignment.updateMany({
            where: {
              userId: user.id,
              schoolId: enrollment.schoolId,
              academicYearId,
              role: "STUDENT",
            },
            data: { schoolId: oppositeSchoolId },
          });
        }
      }
    });

    revalidatePath("/dashboard/manager/students");

    return { status: "success", data: { direction } };
  } catch (err: any) {
    console.error("TRANSFER_STUDENT_ERROR", err);
    return {
      status: "error",
      error: `خطا در انتقال دانش‌آموز: ${err?.message || "نامشخص"}`,
    };
  }
}
