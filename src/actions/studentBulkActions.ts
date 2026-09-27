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

const CONCURRENCY = 5;

/**
 * اجرای موازی محدود
 */
async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  const queue = [...items];
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (item === undefined) return;
        await fn(item);
      }
    },
  );
  await Promise.all(workers);
}

export async function bulkCreateStudents(
  input: unknown,
): Promise<ActionSuccess<BulkResult> | ActionError> {
  const parsed = bulkStudentsSchema.safeParse(input);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message || "داده نامعتبر");
  }

  const scope = await getScope(PERMISSIONS.MANAGE_STUDENTS);
  if (isScopeError(scope)) return error(scope.error);

  const { schoolId, academicYearId, username } = scope;

  // ۱. کلاس
  const klass = await prisma.klass.findFirst({
    where: { id: parsed.data.klassId, schoolId, academicYearId },
    select: { id: true, title: true, payeId: true, reshtehTahsiliId: true },
  });

  if (!klass) return error("کلاس انتخاب‌شده یافت نشد");

  const payeId = klass.payeId;
  const reshtehId = klass.reshtehTahsiliId;
  const rows = parsed.data.students;

  const result: BulkResult = {
    total: rows.length,
    created: 0,
    skipped: 0,
    errors: [],
  };

  // ۲. Batch check: تمام دانش‌آموزان موجود + ثبت‌نام‌های موجود
  const nationalCodes = rows.map((r) => r.nationalCode);

  const existingStudents = await prisma.student.findMany({
    where: { nationalCode: { in: nationalCodes } },
    select: {
      id: true,
      nationalCode: true,
      enrollments: {
        where: { schoolId, academicYearId },
        select: { id: true },
      },
    },
  });

  const existingStudentMap = new Map(
    existingStudents.map((s) => [s.nationalCode, s]),
  );

  // ۳. فیلتر کردن ردیف‌های تکراری
  const rowsToProcess: Array<{
    row: (typeof rows)[number];
    rowNumber: number;
    existingStudentId: string | null;
  }> = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2;
    const existing = existingStudentMap.get(row.nationalCode);

    if (existing && existing.enrollments.length > 0) {
      result.errors.push({
        row: rowNumber,
        nationalCode: row.nationalCode,
        message: "این دانش‌آموز قبلاً در این مدرسه و سال ثبت‌نام شده است",
      });
      result.skipped++;
      continue;
    }

    rowsToProcess.push({
      row,
      rowNumber,
      existingStudentId: existing?.id ?? null,
    });
  }

  // ۴. پردازش موازی با محدودیت
  await runWithConcurrency(rowsToProcess, CONCURRENCY, async (item) => {
    const { row, rowNumber, existingStudentId } = item;

    try {
      // ۴.۱ ساخت/آپدیت دانش‌آموز + ثبت‌نام در یک تراکنش کوتاه
      const enrollment = await prisma.$transaction(async (tx) => {
        let studentId = existingStudentId;

        if (!studentId) {
          const created = await tx.student.create({
            data: {
              firstName: row.firstName,
              lastName: row.lastName,
              nationalCode: row.nationalCode,
              phone: row.phone || "",
              fatherName: row.fatherName || null,
              lastEditedByUsername: username,
            },
            select: { id: true },
          });
          studentId = created.id;
        }

        const enr = await tx.studentEnrollment.create({
          data: {
            studentId,
            schoolId,
            academicYearId,
            payeId,
            reshtehTahsiliId: reshtehId,
            klassId: klass.id,
            lastEditedByUsername: username,
          },
          select: { id: true },
        });

        return { studentId, enrollmentId: enr.id };
      });

      // ۴.۲ ساخت auth user — خارج از تراکنش
      if (row.phone?.trim()) {
        const studentEmail = `${row.nationalCode}@lms.local`.toLowerCase();

        let authUser = await prisma.user.findUnique({
          where: { email: studentEmail },
          select: { id: true },
        });

        if (!authUser) {
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

            authUser = await prisma.user.findUnique({
              where: { email: studentEmail },
              select: { id: true },
            });
          } catch (e) {
            authUser = await prisma.user.findUnique({
              where: { email: studentEmail },
              select: { id: true },
            });
          }
        }

        // ۴.۳ UserAssignment
        if (authUser) {
          const existing = await prisma.userAssignment.findFirst({
            where: {
              userId: authUser.id,
              schoolId,
              academicYearId,
              role: "STUDENT",
            },
            select: { id: true },
          });

          if (!existing) {
            await prisma.userAssignment.create({
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
      }

      result.created++;
    } catch (err: any) {
      console.error("Bulk row error:", err);
      result.errors.push({
        row: rowNumber,
        nationalCode: row.nationalCode,
        message: err?.message || "خطای نامشخص",
      });
      result.skipped++;
    }
  });

  revalidatePath("/dashboard/manager/students");

  return success(result);
}
