"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getScope } from "@/lib/auth-helpers";
import { isScopeError } from "@/lib/auth-helpers-utils";
import { PERMISSIONS } from "@/lib/permissions";
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

export async function bulkCreateTeachers(
  input: unknown,
): Promise<ActionSuccess<BulkResult> | ActionError> {
  const parsed = bulkTeachersSchema.safeParse(input);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message || "داده نامعتبر");
  }

  const scope = await getScope(PERMISSIONS.MANAGE_TEACHERS);
  if (isScopeError(scope)) return error(scope.error);

  const { schoolId, academicYearId, username } = scope;
  const rows = parsed.data.teachers;

  const result: BulkResult = {
    total: rows.length,
    created: 0,
    skipped: 0,
    errors: [],
  };

  // ۱. Batch check: تمام معلمان موجود + انتساب‌های موجود در این مدرسه/سال
  const nationalCodes = rows.map((r) => r.nationalCode);

  const existingTeachers = await prisma.teacher.findMany({
    where: { nationalCode: { in: nationalCodes } },
    select: {
      id: true,
      nationalCode: true,
      phone: true,
      personnelCode: true,
      userId: true,
      assignments: {
        where: { schoolId, academicYearId },
        select: { id: true },
      },
    },
  });

  const teacherMap = new Map(existingTeachers.map((t) => [t.nationalCode, t]));

  // ۲. فیلتر کردن ردیف‌های تکراری
  const rowsToProcess: Array<{
    row: (typeof rows)[number];
    rowNumber: number;
    existingTeacherId: string | null;
    existingUserId: string | null;
  }> = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2;
    const existing = teacherMap.get(row.nationalCode);

    if (existing && existing.assignments.length > 0) {
      result.errors.push({
        row: rowNumber,
        nationalCode: row.nationalCode,
        message: "این معلم قبلاً در این مدرسه و سال ثبت شده است",
      });
      result.skipped++;
      continue;
    }

    rowsToProcess.push({
      row,
      rowNumber,
      existingTeacherId: existing?.id ?? null,
      existingUserId: existing?.userId ?? null,
    });
  }

  // ۳. پردازش موازی
  await runWithConcurrency(rowsToProcess, CONCURRENCY, async (item) => {
    const { row, rowNumber, existingTeacherId, existingUserId } = item;

    try {
      // ۳.۱ ساخت/آپدیت معلم + انتساب در یک تراکنش کوتاه
      const teacher = await prisma.$transaction(async (tx) => {
        let teacherId = existingTeacherId;
        let teacherUserId: string | null = existingUserId;

        if (!teacherId) {
          // معلم جدید
          const created = await tx.teacher.create({
            data: {
              firstName: row.firstName,
              lastName: row.lastName,
              nationalCode: row.nationalCode,
              phone: row.phone || "",
              personnelCode: row.personnelCode || null,
              lastEditedByUsername: username,
            },
            select: { id: true, userId: true },
          });
          teacherId = created.id;
          teacherUserId = created.userId;
        } else {
          // آپدیت معلم موجود
          const updated = await tx.teacher.update({
            where: { id: teacherId },
            data: {
              firstName: row.firstName,
              lastName: row.lastName,
              phone: row.phone || undefined,
              personnelCode: row.personnelCode || undefined,
              lastEditedByUsername: username,
            },
            select: { id: true, userId: true },
          });
          teacherUserId = updated.userId;
        }

        // ساخت TeacherAssignment
        await tx.teacherAssignment.create({
          data: {
            teacherId,
            schoolId,
            academicYearId,
            isActive: true,
            lastEditedByUsername: username,
          },
        });

        return { teacherId, teacherUserId };
      });

      // ۳.۲ ساخت auth user — خارج از تراکنش
      const teacherEmail = `${row.nationalCode}@lms.local`.toLowerCase();
      let authUserId = teacher.teacherUserId;

      if (!authUserId && row.phone?.trim()) {
        // چک وجود کاربر
        let user = await prisma.user.findUnique({
          where: { email: teacherEmail },
          select: { id: true },
        });

        if (!user) {
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

            user = await prisma.user.findUnique({
              where: { email: teacherEmail },
              select: { id: true },
            });
          } catch (authError) {
            user = await prisma.user.findUnique({
              where: { email: teacherEmail },
              select: { id: true },
            });
          }
        }

        authUserId = user?.id ?? null;
      }

      if (!authUserId) {
        throw new Error("خطا در ساخت حساب کاربری");
      }

      // ۳.۳ اتصال Teacher به User + UserAssignment
      await prisma.$transaction(async (tx) => {
        await tx.teacher.update({
          where: { id: teacher.teacherId },
          data: { userId: authUserId },
        });

        const existingAssignment = await tx.userAssignment.findFirst({
          where: {
            userId: authUserId!,
            schoolId,
            academicYearId,
            role: "TEACHER",
          },
          select: { id: true },
        });

        if (!existingAssignment) {
          await tx.userAssignment.create({
            data: {
              userId: authUserId!,
              schoolId,
              academicYearId,
              role: "TEACHER",
              isActive: true,
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
  });

  revalidatePath("/dashboard/manager/teachers");

  return success(result);
}
