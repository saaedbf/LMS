"use server";

import { prisma } from "@/lib/prisma";
import { getScope } from "@/lib/auth-helpers";
import { isScopeError } from "@/lib/auth-helpers-utils";
import { PERMISSIONS } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import {
  teacherAssignmentSchema,
  TeacherAssignmentSchema,
} from "@/lib/schemas/teacher";

type ActionSuccess<T> = { status: "success"; data: T };
type ActionError = { status: "error"; error: string };

function success<T>(data: T): ActionSuccess<T> {
  return { status: "success", data };
}

function error(message: string): ActionError {
  return { status: "error", error: message };
}

export async function createTeacherAssignment(
  input: TeacherAssignmentSchema,
): Promise<ActionSuccess<any> | ActionError> {
  const parsed = teacherAssignmentSchema.safeParse(input);
  if (!parsed.success) {
    return error(
      parsed.error.issues[0]?.message ?? "اطلاعات انتساب نامعتبر است.",
    );
  }

  const scope = await getScope(PERMISSIONS.MANAGE_TEACHERS);
  if (isScopeError(scope)) return error(scope.error);

  const { schoolId, academicYearId, username } = scope;

  try {
    const duplicate = await prisma.teacherAssignment.findUnique({
      where: {
        teacherId_schoolId_academicYearId: {
          teacherId: parsed.data.teacherId,
          schoolId: parsed.data.schoolId,
          academicYearId: parsed.data.academicYearId,
        },
      },
    });

    if (duplicate) {
      return error("این معلم قبلاً در همین مدرسه و سال تحصیلی منتسب شده است.");
    }

    const assignment = await prisma.teacherAssignment.create({
      data: {
        teacherId: parsed.data.teacherId,
        schoolId: parsed.data.schoolId,
        academicYearId: parsed.data.academicYearId,
        isActive: parsed.data.isActive ?? true,
        lastEditedByUsername: username,
      },
      include: {
        school: true,
        academicYear: true,
      },
    });

    revalidatePath("/dashboard/manager/teachers");
    return success(assignment);
  } catch (err) {
    return error("خطا در ایجاد انتساب معلم.");
  }
}

export async function deleteTeacherAssignment(assignmentId: string) {
  try {
    const scope = await getScope(PERMISSIONS.MANAGE_TEACHERS);
    if (isScopeError(scope)) {
      return { status: "error" as const, error: scope.error };
    }

    const { schoolId, academicYearId } = scope;

    const assignment = await prisma.teacherAssignment.findFirst({
      where: {
        id: assignmentId,
        schoolId,
        academicYearId,
      },
      include: {
        teacher: {
          select: { id: true, firstName: true, lastName: true, userId: true },
        },
      },
    });

    if (!assignment) {
      return { status: "error" as const, error: "انتساب یافت نشد" };
    }

    const klassesInSchool = await prisma.klass.findMany({
      where: { schoolId, academicYearId },
      select: { id: true },
    });

    const klassIds = klassesInSchool.map((k) => k.id);

    const classCourseCount = await prisma.classCourse.count({
      where: {
        teacherId: assignment.teacherId,
        klassId: { in: klassIds },
      },
    });

    if (classCourseCount > 0) {
      return {
        status: "error" as const,
        error: `این معلم در ${classCourseCount} کلاس تدریس می‌کند. ابتدا از صفحه "تخصیص معلم به کلاس" تخصیص‌ها را حذف کنید.`,
      };
    }

    await prisma.teacherAssignment.delete({
      where: { id: assignmentId },
    });

    if (assignment.teacher.userId) {
      await prisma.userAssignment.deleteMany({
        where: {
          userId: assignment.teacher.userId,
          schoolId,
          academicYearId,
          role: "TEACHER",
        },
      });
    }

    revalidatePath("/dashboard/manager/teachers");
    revalidatePath("/dashboard/manager/class-course");

    return {
      status: "success" as const,
      data: { id: assignmentId },
    };
  } catch (error) {
    console.error("DELETE_TEACHER_ASSIGNMENT_ERROR", error);
    return { status: "error" as const, error: "خطا در حذف انتساب" };
  }
}
