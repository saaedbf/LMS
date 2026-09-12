"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import {
  teacherAssignmentSchema,
  TeacherAssignmentSchema,
} from "@/lib/schemas/teacher";
import { revalidatePath } from "next/cache";

type ActionSuccess<T> = {
  status: "success";
  data: T;
};

type ActionError = {
  status: "error";
  error: string;
};

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

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return error("برای انجام این عملیات ابتدا وارد حساب کاربری خود شوید.");
  }

  const currentUsername = currentUser.email || currentUser.name || "unknown";

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
        lastEditedByUsername: currentUsername,
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
