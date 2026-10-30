"use server";

import { prisma } from "@/lib/prisma";
import { getScope } from "@/lib/auth-helpers";
import { isScopeError } from "@/lib/auth-helpers-utils";
import { PERMISSIONS } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ENCOURAGEMENT_ROUTE = "/dashboard/manager/encouragement";

export type EncouragementListItem = {
  id: string;
  date: Date;
  startTime: string;
  reason: string;
  type: string;
  studentEnrollment: {
    student: { firstName: string; lastName: string; nationalCode: string };
    klass: { title: string };
    paye: { title: string };
  };
};

const createEncouragementSchema = z.object({
  enrollmentIds: z.array(z.string()).min(1, "حداقل یک دانش‌آموز انتخاب کنید"),
  date: z.string(),
  startTime: z.string().min(1, "ساعت الزامی است"),
  reason: z.string().min(1, "توضیحات الزامی است"),
  type: z.enum([
    "EDUCATIONAL",
    "CULTURAL",
    "DISCIPLINARY",
    "COMPETITIONS",
    "KHAVARAZMI",
    "OTHER",
  ]),
});

// ⬅️ ۱. ثبت تشویق
export async function createEncouragementAction(input: unknown) {
  const parsed = createEncouragementSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error" as const, error: parsed.error.issues[0].message };
  }

  const scope = await getScope(PERMISSIONS.MANAGE_DISCIPLINARY);
  if (isScopeError(scope))
    return { status: "error" as const, error: scope.error };

  const { schoolId, academicYearId, username } = scope;
  const dateObj = new Date(parsed.data.date);

  try {
    let created = 0;
    let skipped = 0;

    for (const enrollmentId of parsed.data.enrollmentIds) {
      const existing = await prisma.studentEncouragement.findFirst({
        where: {
          studentEnrollmentId: enrollmentId,
          date: dateObj,
          startTime: parsed.data.startTime,
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.studentEncouragement.create({
        data: {
          studentEnrollmentId: enrollmentId,
          date: dateObj,
          startTime: parsed.data.startTime,
          reason: parsed.data.reason,
          type: parsed.data.type,
          lastEditedByUsername: username,
        },
      });
      created++;
    }

    revalidatePath(ENCOURAGEMENT_ROUTE);
    return { status: "success" as const, data: { created, skipped } };
  } catch (error) {
    console.error("createEncouragementAction error:", error);
    return { status: "error" as const, error: "خطا در ثبت تشویق" };
  }
}

// ⬅️ ۲. دریافت لیست تشویق‌ها
export async function getEncouragement(
  page: number,
  pageSize: number,
  options: {
    sortField?: string;
    sortOrder?: "asc" | "desc";
    searchField?: string;
    searchValue?: string;
  },
) {
  const scope = await getScope(PERMISSIONS.MANAGE_DISCIPLINARY);
  if (isScopeError(scope)) return { items: [], total: 0 };

  const { schoolId, academicYearId } = scope;
  const { sortField, sortOrder, searchField, searchValue } = options;
  const skip = (page - 1) * pageSize;

  const where: any = {
    studentEnrollment: { schoolId, academicYearId },
  };

  if (searchField && searchValue) {
    if (searchField === "reason") {
      where.reason = { contains: searchValue, mode: "insensitive" };
    }
    // برای جستجوی نام، پایه و کلاس باید در سرور شرط اضافه شود که برای سادگی فعلاً از آن صرف‌نظر می‌کنیم
  }

  try {
    const [items, total] = await prisma.$transaction([
      prisma.studentEncouragement.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { date: sortOrder || "desc" },
        include: {
          studentEnrollment: {
            include: {
              student: true,
              klass: true,
              paye: true,
            },
          },
        },
      }),
      prisma.studentEncouragement.count({ where }),
    ]);

    return { items: items as any[], total };
  } catch (error) {
    console.error("getEncouragement error:", error);
    return { items: [], total: 0 };
  }
}

// ⬅️ ۳. ویرایش تشویق
export async function updateEncouragementAction(input: unknown) {
  const parsed = z
    .object({
      id: z.string(),
      date: z.string(),
      startTime: z.string(),
      reason: z.string(),
      type: z.enum([
        "EDUCATIONAL",
        "CULTURAL",
        "DISCIPLINARY",
        "COMPETITIONS",
        "KHAVARAZMI",
        "OTHER",
      ]),
    })
    .safeParse(input);

  if (!parsed.success)
    return { status: "error" as const, error: "داده نامعتبر" };

  const scope = await getScope(PERMISSIONS.MANAGE_DISCIPLINARY);
  if (isScopeError(scope))
    return { status: "error" as const, error: scope.error };

  try {
    await prisma.studentEncouragement.update({
      where: { id: parsed.data.id },
      data: {
        date: new Date(parsed.data.date),
        startTime: parsed.data.startTime,
        reason: parsed.data.reason,
        type: parsed.data.type,
        lastEditedByUsername: scope.username,
      },
    });
    revalidatePath(ENCOURAGEMENT_ROUTE);
    return { status: "success" as const, data: true };
  } catch (error) {
    return { status: "error" as const, error: "خطا در ویرایش" };
  }
}

// ⬅️ ۴. حذف تشویق
export async function deleteEncouragementAction(input: { id: string }) {
  const scope = await getScope(PERMISSIONS.MANAGE_DISCIPLINARY);
  if (isScopeError(scope))
    return { status: "error" as const, error: scope.error };

  try {
    await prisma.studentEncouragement.delete({ where: { id: input.id } });
    revalidatePath(ENCOURAGEMENT_ROUTE);
    return { status: "success" as const, data: true };
  } catch (error) {
    return { status: "error" as const, error: "خطا در حذف" };
  }
}

// ⬅️ ۵. خروجی اکسل
export async function getAllEncouragementsForExport() {
  const scope = await getScope(PERMISSIONS.MANAGE_DISCIPLINARY);
  if (isScopeError(scope)) return [];

  const { schoolId, academicYearId } = scope;

  return prisma.studentEncouragement.findMany({
    where: { studentEnrollment: { schoolId, academicYearId } },
    include: {
      studentEnrollment: {
        include: { student: true, klass: true, paye: true },
      },
    },
    orderBy: { date: "desc" },
  });
}
