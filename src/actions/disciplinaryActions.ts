"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import {
  createDisciplinarySchema,
  CreateDisciplinarySchema,
  DeleteDisciplinaryeSchema,
  deleteDisciplinarySchema,
  updateDisciplinarySchema,
  UpdateDisciplinarySchema,
} from "@/lib/schemas/disciplinarySchemas";
import { ActionResult } from "@/types/index";
import { ListOptions } from "@/types/myTypes";
import { StudentDisciplinary } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { parseJalaliDate } from "@/lib/dateUtils";
const Disiplinary_ROUTE = "/dashboard/manager/disiplinary";

type SessionScope = { schoolId: number; academicYearId: number };

async function getManagerScope(): Promise<SessionScope | { error: string }> {
  const currentUser = await getCurrentUser();

  if (!currentUser || !currentUser.id) {
    return { error: "برای انجام این عملیات ابتدا وارد حساب کاربری خود شوید." };
  }

  const assignment = await prisma.userAssignment.findFirst({
    where: {
      userId: currentUser.id,
      role: "MANAGER",
    },
  });

  if (!assignment) {
    return { error: "شما دسترسی مدیر مدرسه در این جلسه را ندارید" };
  }

  if (assignment.schoolId == null || assignment.academicYearId == null) {
    return { error: "انتساب فعال معتبر نیست" };
  }

  return {
    schoolId: assignment.schoolId,
    academicYearId: assignment.academicYearId,
  };
}

export type DisciplinaryListItem = StudentDisciplinary & {
  studentEnrollment: {
    student: { id: string; firstName: string; lastName: string };
    paye: { id: number; title: string } | null;
    klass: { id: string; title: string } | null;
  };
};

// ==========================================
// 1. دریافت لیست  (ساده، سریع )
// ==========================================
export async function getDisciplinary(
  page: number,
  pageSize: number,
  options?: ListOptions,
): Promise<{ items: DisciplinaryListItem[]; total: number }> {
  const scope = await getManagerScope();
  if ("error" in scope) {
    return { items: [], total: 0 };
  }

  const {
    sortField = "createdAt",
    sortOrder = "desc",
    searchField,
    searchValue,
  } = options ?? {};

  const skip = (page - 1) * pageSize;

  // ۱. فیلتر پایه برای مدرسه و سال تحصیلی جاری
  const where: any = {
    studentEnrollment: {
      schoolId: scope.schoolId,
      academicYearId: scope.academicYearId,
    },
  };

  // ۲. اضافه کردن جستجوی پویا
  if (searchField && searchValue?.trim()) {
    const val = searchValue.trim();

    switch (searchField) {
      case "studentName":
        where.studentEnrollment.student = {
          OR: [
            { firstName: { contains: val, mode: "insensitive" } },
            { lastName: { contains: val, mode: "insensitive" } },
          ],
        };
        break;

      case "paye":
        where.studentEnrollment.paye = {
          title: { contains: val, mode: "insensitive" },
        };
        break;

      case "klass":
        where.studentEnrollment.klass = {
          title: { contains: val, mode: "insensitive" },
        };
        break;

      // در قسمت case "date":
      case "date": {
        // ابتدا تلاش برای parse تاریخ شمسی
        const jalaliDate = parseJalaliDate(val);
        if (jalaliDate) {
          const startOfDay = new Date(jalaliDate);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(jalaliDate);
          endOfDay.setHours(23, 59, 59, 999);

          where.date = {
            gte: startOfDay,
            lte: endOfDay,
          };
          break;
        }

        // اگر تاریخ شمسی نبود، تلاش برای parse تاریخ میلادی
        const dateObj = new Date(val);
        if (!isNaN(dateObj.getTime())) {
          const startOfDay = new Date(dateObj);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(dateObj);
          endOfDay.setHours(23, 59, 59, 999);

          where.date = {
            gte: startOfDay,
            lte: endOfDay,
          };
          break;
        }

        // در غیر این صورت، جستجوی contains
        where.date = { contains: val, mode: "insensitive" };
        break;
      }

      case "reason":
        where.reason = { contains: val, mode: "insensitive" };
        break;

      case "startTime":
        where.startTime = { contains: val, mode: "insensitive" };
        break;

      default:
        // برای فیلدهای دیگر
        if (searchField === "id") {
          where.id = val;
        } else {
          where[searchField] = { contains: val, mode: "insensitive" };
        }
    }
  }

  // ۳. مرتب‌سازی (OrderBy)
  let orderBy: any = { [sortField]: sortOrder };

  switch (sortField) {
    case "studentName":
      orderBy = {
        studentEnrollment: {
          student: { firstName: sortOrder },
        },
      };
      break;

    case "paye":
      orderBy = {
        studentEnrollment: {
          paye: { title: sortOrder },
        },
      };
      break;

    case "klass":
      orderBy = {
        studentEnrollment: {
          klass: { title: sortOrder },
        },
      };
      break;

    case "date":
      orderBy = { date: sortOrder };
      break;

    case "reason":
      orderBy = { reason: sortOrder };
      break;

    case "startTime":
      orderBy = { startTime: sortOrder };
      break;

    default:
      orderBy = { [sortField]: sortOrder };
  }

  try {
    const [items, total] = await prisma.$transaction([
      prisma.studentDisciplinary.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          studentEnrollment: {
            include: {
              student: {
                select: { id: true, firstName: true, lastName: true },
              },
              paye: {
                select: { id: true, title: true },
              },
              klass: {
                select: { id: true, title: true },
              },
            },
          },
        },
      }),
      prisma.studentDisciplinary.count({ where }),
    ]);

    return { items: items as DisciplinaryListItem[], total };
  } catch (error) {
    console.error("getDisiplinary error:", error);
    return { items: [], total: 0 };
  }
}

// تابع کمکی برای parse تاریخ
function parseDate(dateStr: string): Date | null {
  // فرمت‌های پشتیبانی شده
  const patterns = [
    // فرمت شمسی: 1402/01/01 یا 1402-01-01
    /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/,
    // فرمت میلادی: 2023-01-01
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
  ];

  for (const pattern of patterns) {
    const match = dateStr.match(pattern);
    if (match) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]);
      const day = parseInt(match[3]);

      // بررسی اعتبار تاریخ
      if (year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        try {
          // برای تاریخ شمسی، باید به میلادی تبدیل شود
          // اینجا یک تبدیل ساده انجام می‌دهیم
          // برای دقت بیشتر از کتابخانه‌های تبدیل تاریخ استفاده کنید
          const dateObj = new Date(year, month - 1, day);
          if (!isNaN(dateObj.getTime())) {
            return dateObj;
          }
        } catch (e) {
          console.error("Date parsing error:", e);
        }
      }
    }
  }

  // اگر فرمت شناسایی نشد، try catch برای new Date
  try {
    const dateObj = new Date(dateStr);
    if (!isNaN(dateObj.getTime())) {
      return dateObj;
    }
  } catch (e) {
    console.error("Date parsing error:", e);
  }

  return null;
}

// ==========================================
// 2. توابع فیلتر و انتخاب دانش‌آموز برای فرم ثبت
// ==========================================
export async function getDisiplinaryFilterOptions(): Promise<{
  status: "success" | "error";
  payes?: { id: number; title: string }[];
  klasses?: { id: string; title: string; payeId: number }[];
}> {
  try {
    const scope = await getManagerScope();
    if ("error" in scope) return { status: "error" };

    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        schoolId: scope.schoolId,
        academicYearId: scope.academicYearId,
      },
      select: {
        paye: { select: { id: true, title: true } },
        klass: { select: { id: true, title: true, payeId: true } },
      },
    });

    const payeMap = new Map<number, { id: number; title: string }>();
    const klassMap = new Map<
      string,
      { id: string; title: string; payeId: number }
    >();

    for (const e of enrollments) {
      if (e.paye) payeMap.set(e.paye.id, e.paye);
      if (e.klass) klassMap.set(e.klass.id, e.klass);
    }

    return {
      status: "success",
      payes: [...payeMap.values()].sort((a, b) => a.id - b.id),
      klasses: [...klassMap.values()].sort((a, b) =>
        a.title.localeCompare(b.title, "fa"),
      ),
    };
  } catch (error) {
    console.error(error);
    return { status: "error" };
  }
}

export type StudentOption = {
  enrollmentId: string;
  fullName: string;
  klassTitle: string;
  payeTitle: string;
};

export async function getStudentsForDisiplinary(filters: {
  payeId?: number;
  klassId?: string;
}): Promise<ActionResult<StudentOption[]>> {
  try {
    const scope = await getManagerScope();
    if ("error" in scope) return { status: "error", error: scope.error };

    const rows = await prisma.studentEnrollment.findMany({
      where: {
        schoolId: scope.schoolId,
        academicYearId: scope.academicYearId,
        ...(filters.payeId ? { payeId: filters.payeId } : {}),
        ...(filters.klassId ? { klassId: filters.klassId } : {}),
      },
      include: {
        student: { select: { firstName: true, lastName: true } },
        paye: { select: { title: true } },
        klass: { select: { title: true } },
      },
      orderBy: { student: { firstName: "asc" } },
    });

    return {
      status: "success",
      data: rows.map((r) => ({
        enrollmentId: r.id,
        fullName: `${r.student.firstName} ${r.student.lastName}`,
        klassTitle: r.klass?.title || "",
        payeTitle: r.paye?.title || "",
      })),
    };
  } catch (error) {
    console.error(error);
    return { status: "error", error: "خطا در دریافت دانش‌آموزان" };
  }
}

// ==========================================
// 3. عملیات ثبت، ویرایش و حذف
// ==========================================
export async function createDisciplinaryAction(
  data: CreateDisciplinarySchema,
): Promise<ActionResult<{ created: number; skipped: number }>> {
  try {
    const parsed = createDisciplinarySchema.safeParse(data);
    if (!parsed.success) {
      return {
        status: "error",
        error: parsed.error.issues[0]?.message || "داده‌های ورودی نامعتبر است",
      };
    }
    const { enrollmentIds, date, startTime, reason } = parsed.data;

    const scope = await getManagerScope();
    if ("error" in scope) return { status: "error", error: scope.error };

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return { status: "error", error: "تاریخ نامعتبر است" };
    }

    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        id: { in: enrollmentIds },
        schoolId: scope.schoolId,
        academicYearId: scope.academicYearId,
      },
      select: { id: true },
    });

    if (enrollments.length === 0) {
      return { status: "error", error: "دانش‌آموزی یافت نشد" };
    }

    const result = await prisma.$transaction(async (tx) => {
      let created = 0;
      let skipped = 0;
      for (const e of enrollments) {
        const exists = await tx.studentDisciplinary.findFirst({
          where: {
            studentEnrollmentId: e.id,
            date: parsedDate,
            startTime,
          },
        });
        if (exists) {
          skipped++;
          continue;
        }
        await tx.studentDisciplinary.create({
          data: {
            studentEnrollmentId: e.id,
            date: parsedDate,
            startTime,
            reason,
          },
        });
        created++;
      }
      return { created, skipped };
    });

    revalidatePath(Disiplinary_ROUTE);
    return { status: "success", data: result };
  } catch (error) {
    console.error(error);
    return { status: "error", error: "خطا در ثبت موارد انضباطی" };
  }
}

export async function updateDisiplinaryAction(
  data: UpdateDisciplinarySchema,
): Promise<ActionResult<StudentDisciplinary>> {
  try {
    const parsed = updateDisciplinarySchema.safeParse(data);
    if (!parsed.success) {
      return {
        status: "error",
        error: parsed.error.issues[0]?.message || "داده‌های ورودی نامعتبر است",
      };
    }

    const scope = await getManagerScope();
    if ("error" in scope) return { status: "error", error: scope.error };

    const disiplinary = await prisma.studentDisciplinary.findFirst({
      where: {
        id: parsed.data.id,
        studentEnrollment: {
          schoolId: scope.schoolId,
          academicYearId: scope.academicYearId,
        },
      },
    });
    if (!disiplinary) return { status: "error", error: "مورد یافت نشد" };
    const parsedDate = new Date(`${parsed.data.date}T00:00:00`);
    if (isNaN(parsedDate.getTime())) {
      return { status: "error", error: "تاریخ نامعتبر است" };
    }
    const duplicate = await prisma.studentDisciplinary.findFirst({
      where: {
        studentEnrollmentId: disiplinary.studentEnrollmentId,
        date: parsedDate,
        startTime: parsed.data.startTime,

        id: { not: disiplinary.id },
      },
      select: { id: true },
    });
    if (duplicate) {
      return {
        status: "error",
        error:
          "برای این دانش‌آموز در همین تاریخ و بازه زمانی مورد انضباطی ثبت شده است",
      };
    }

    const result = await prisma.studentDisciplinary.update({
      where: { id: disiplinary.id },
      data: {
        date: parsedDate,
        startTime: parsed.data.startTime,
        reason: parsed.data.reason,
      },
    });

    revalidatePath(Disiplinary_ROUTE);
    return { status: "success", data: result };
  } catch (error) {
    console.error(error);
    return { status: "error", error: "خطا در ویرایش " };
  }
}

export async function deleteDisiplinaryAction(
  data: DeleteDisciplinaryeSchema,
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = deleteDisciplinarySchema.safeParse(data);
    if (!parsed.success) {
      return {
        status: "error",
        error: parsed.error.issues[0]?.message || "داده‌های ورودی نامعتبر است",
      };
    }

    const scope = await getManagerScope();
    if ("error" in scope) return { status: "error", error: scope.error };

    const disiplinary = await prisma.studentDisciplinary.findFirst({
      where: {
        id: parsed.data.id,
        studentEnrollment: {
          schoolId: scope.schoolId,
          academicYearId: scope.academicYearId,
        },
      },
      select: { id: true },
    });
    if (!disiplinary) return { status: "error", error: "مورد یافت نشد" };

    await prisma.studentDisciplinary.delete({ where: { id: disiplinary.id } });

    revalidatePath(Disiplinary_ROUTE);
    return { status: "success", data: { id: disiplinary.id } };
  } catch (error) {
    console.error(error);
    return { status: "error", error: "خطا در حذف " };
  }
}
