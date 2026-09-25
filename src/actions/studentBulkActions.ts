"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getScope } from "@/lib/auth-helpers";
import { isScopeError } from "@/lib/auth-helpers-utils";
import { PERMISSIONS } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { bulkStudentsSchema } from "@/lib/schemas/studentBulk";

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

export async function bulkCreateStudents(
  input: unknown,
): Promise<ActionSuccess<BulkResult> | ActionError> {
  const parsed = bulkStudentsSchema.safeParse(input);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message || "داده نامعتبر");
  }

  // ⬅️ یک خط جای ۱۲ خط
  const scope = await getScope(PERMISSIONS.MANAGE_STUDENTS);
  if (isScopeError(scope)) return error(scope.error);

  const { schoolId, academicYearId, username } = scope;

  // پیدا کردن کلاس و استخراج پایه و رشته از آن
  const klass = await prisma.klass.findFirst({
    where: {
      id: parsed.data.klassId,
      schoolId,
      academicYearId,
    },
    select: {
      id: true,
      title: true,
      payeId: true,
      reshtehTahsiliId: true,
    },
  });

  if (!klass) {
    return error("کلاس انتخاب‌شده یافت نشد");
  }

  const payeId = klass.payeId;
  const reshtehId = klass.reshtehTahsiliId;

  const result: BulkResult = {
    total: parsed.data.students.length,
    created: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 0; i < parsed.data.students.length; i++) {
    const row = parsed.data.students[i];
    const rowNumber = i + 2;

    try {
      const existingEnrollment = await prisma.studentEnrollment.findFirst({
        where: {
          student: { nationalCode: row.nationalCode },
          schoolId,
          academicYearId,
        },
      });

      if (existingEnrollment) {
        result.errors.push({
          row: rowNumber,
          nationalCode: row.nationalCode,
          message: "این دانش‌آموز قبلاً در این مدرسه و سال ثبت‌نام شده است",
        });
        result.skipped++;
        continue;
      }

      await prisma.$transaction(async (tx) => {
        let student = await tx.student.findUnique({
          where: { nationalCode: row.nationalCode },
        });

        if (!student) {
          student = await tx.student.create({
            data: {
              firstName: row.firstName,
              lastName: row.lastName,
              nationalCode: row.nationalCode,
              phone: row.phone || "",
              fatherName: row.fatherName || null,
              lastEditedByUsername: username,
            },
          });
        }

        await tx.studentEnrollment.create({
          data: {
            studentId: student.id,
            schoolId,
            academicYearId,
            payeId,
            reshtehTahsiliId: reshtehId,
            klassId: klass.id,
            lastEditedByUsername: username,
          },
        });

        const studentEmail = `${row.nationalCode}@lms.local`.toLowerCase();

        let authUser = await tx.user.findUnique({
          where: { email: studentEmail },
        });

        if (!authUser && row.phone) {
          try {
            await auth.api.signUpEmail({
              headers: await headers(),
              body: {
                email: studentEmail,
                password: row.phone.trim(),
                firstName: row.firstName,
                lastName: row.lastName,
                name: `${row.firstName} ${row.lastName}`,
              },
            });

            authUser = await tx.user.findUnique({
              where: { email: studentEmail },
            });
          } catch (e) {
            authUser = await tx.user.findUnique({
              where: { email: studentEmail },
            });
          }
        }

        if (authUser) {
          const existingAssignment = await tx.userAssignment.findFirst({
            where: {
              userId: authUser.id,
              schoolId,
              academicYearId,
              role: "STUDENT",
            },
          });

          if (!existingAssignment) {
            await tx.userAssignment.create({
              data: {
                userId: authUser.id,
                schoolId,
                academicYearId,
                role: "STUDENT",
                isActive: true,
              },
            });
          }
        }
      });

      result.created++;
    } catch (err: any) {
      console.error("Bulk student row error:", err);
      result.errors.push({
        row: rowNumber,
        nationalCode: row.nationalCode,
        message: err?.message || "خطای نامشخص",
      });
      result.skipped++;
    }
  }

  revalidatePath("/dashboard/manager/students");

  return success(result);
}
