"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth-server";
import { getCurrentContext } from "@/actions/authActions";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { bulkTeachersSchema } from "@/lib/schemas/teacherBulk";

type ActionSuccess<T> = { status: "success"; data: T };
type ActionError = { status: "error"; error: string };

function success<T>(data: T): ActionSuccess<T> {
  return { status: "success", data };
}

function error(message: string): ActionError {
  return { status: "error", error: message };
}

type BulkResult = {
  total: number;
  created: number;
  skipped: number;
  errors: Array<{
    row: number;
    nationalCode: string;
    message: string;
  }>;
};

export async function bulkCreateTeachers(
  input: unknown,
): Promise<ActionSuccess<BulkResult> | ActionError> {
  const parsed = bulkTeachersSchema.safeParse(input);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message || "داده نامعتبر");
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) return error("ابتدا وارد حساب کاربری شوید");

  const context = await getCurrentContext();
  if (!context?.schoolId || !context.academicYearId) {
    return error("کانتکست فعال یافت نشد");
  }

  if (context.role !== "MANAGER" && context.role !== "DEPUTY") {
    return error("دسترسی ندارید");
  }

  const schoolId = context.schoolId;
  const academicYearId = context.academicYearId;
  const username = currentUser.email || currentUser.name || "unknown";

  const result: BulkResult = {
    total: parsed.data.teachers.length,
    created: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 0; i < parsed.data.teachers.length; i++) {
    const row = parsed.data.teachers[i];
    const rowNumber = i + 2;

    try {
      const teacherEmail = `${row.nationalCode}@lms.local`.toLowerCase();

      // ۱. بررسی وجود معلم با این کد ملی
      const existingTeacher = await prisma.teacher.findUnique({
        where: { nationalCode: row.nationalCode },
      });

      // ۲. بررسی انتساب تکراری در همین مدرسه و سال
      if (existingTeacher) {
        const existingAssignment = await prisma.teacherAssignment.findFirst({
          where: {
            teacherId: existingTeacher.id,
            schoolId,
            academicYearId,
          },
        });

        if (existingAssignment) {
          result.errors.push({
            row: rowNumber,
            nationalCode: row.nationalCode,
            message: "این معلم قبلاً در این مدرسه و سال ثبت شده است",
          });
          result.skipped++;
          continue;
        }
      }

      // ۳. تراکنش: ساخت/به‌روزرسانی معلم + کاربر + انتساب
      await prisma.$transaction(async (tx) => {
        let teacher = existingTeacher;

        if (!teacher) {
          // ساخت معلم جدید
          teacher = await tx.teacher.create({
            data: {
              firstName: row.firstName,
              lastName: row.lastName,
              nationalCode: row.nationalCode,
              phone: row.phone || "",
              personnelCode: row.personnelCode || null,
              lastEditedByUsername: username,
            },
          });
        } else {
          // به‌روزرسانی معلم موجود
          teacher = await tx.teacher.update({
            where: { id: teacher.id },
            data: {
              firstName: row.firstName,
              lastName: row.lastName,
              phone: row.phone || teacher.phone,
              personnelCode: row.personnelCode || teacher.personnelCode,
              lastEditedByUsername: username,
            },
          });
        }

        // ۴. بررسی/ساخت User
        let authUser = await tx.user.findUnique({
          where: { email: teacherEmail },
          select: { id: true },
        });

        if (!authUser && row.phone) {
          try {
            await auth.api.signUpEmail({
              headers: await headers(),
              body: {
                email: teacherEmail,
                password: row.phone.trim(),
                firstName: row.firstName,
                lastName: row.lastName,
                name: `${row.firstName} ${row.lastName}`,
              },
            });

            authUser = await tx.user.findUnique({
              where: { email: teacherEmail },
              select: { id: true },
            });
          } catch (authError) {
            authUser = await tx.user.findUnique({
              where: { email: teacherEmail },
              select: { id: true },
            });
          }
        }

        if (!authUser) {
          throw new Error("خطا در ساخت حساب کاربری");
        }

        // ۵. اتصال Teacher به User
        await tx.teacher.update({
          where: { id: teacher.id },
          data: { userId: authUser.id },
        });

        // ۶. ساخت UserAssignment (نقش TEACHER)
        const existingUserAssignment = await tx.userAssignment.findFirst({
          where: {
            userId: authUser.id,
            schoolId,
            academicYearId,
            role: "TEACHER",
          },
        });

        if (!existingUserAssignment) {
          await tx.userAssignment.create({
            data: {
              userId: authUser.id,
              schoolId,
              academicYearId,
              role: "TEACHER",
              isActive: true,
            },
          });
        }

        // ۷. ساخت TeacherAssignment (انتساب به مدرسه و سال)
        const existingTeacherAssignment = await tx.teacherAssignment.findFirst({
          where: {
            teacherId: teacher.id,
            schoolId,
            academicYearId,
          },
        });

        if (!existingTeacherAssignment) {
          await tx.teacherAssignment.create({
            data: {
              teacherId: teacher.id,
              schoolId,
              academicYearId,
              isActive: true,
              lastEditedByUsername: username,
            },
          });
        }
      });

      result.created++;
    } catch (err: any) {
      console.error("Bulk teacher row error:", err);
      result.errors.push({
        row: rowNumber,
        nationalCode: row.nationalCode,
        message: err?.message || "خطای نامشخص",
      });
      result.skipped++;
    }
  }

  revalidatePath("/dashboard/manager/teachers");

  return success(result);
}
