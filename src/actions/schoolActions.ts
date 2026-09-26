"use server";

import { prisma } from "@/lib/prisma";
import { SchoolSchema } from "@/lib/schemas/schoolSchemas";
import { ActionResult } from "@/types/index";
import { School, SchoolRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  getTableData,
  Column,
} from "@/components/widgets/Elements/table/table-utils2";
import { ListOptions } from "@/types/myTypes";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getScope } from "@/lib/auth-helpers";
import { isScopeError } from "@/lib/auth-helpers-utils";
import { PERMISSIONS } from "@/lib/permissions";

// ستون‌های جدول مدرسه
const columns: Column[] = [
  { field: "id", type: "number", searchable: true, sortable: true },
  { field: "title", type: "string", searchable: true, sortable: true },
  { field: "subTitle", type: "string", searchable: true, sortable: true },
  { field: "modirName", type: "string", searchable: true, sortable: true },
  { field: "isActive", type: "boolean", searchable: false, sortable: false },
  { field: "sex", type: "string", searchable: true, sortable: true },
  { field: "schoolType", type: "string", searchable: true, sortable: true },
  {
    field: "doreTitle",
    type: "string",
    searchable: true,
    sortable: true,
    relation: {
      model: "doreTahsili",
      field: "title",
    },
  },
];

// ایجاد مدرسه جدید
export async function createSchoolAction(
  data: SchoolSchema,
): Promise<ActionResult<School>> {
  try {
    const {
      id,
      title,
      subTitle,
      modirName,
      isActive,
      sex,
      schoolType,
      doreTahsiliId,
      oppositeSchoolId,
    } = data;

    // ۱. بررسی تکراری نبودن کد مدرسه
    if (id) {
      const existingId = await prisma.school.findUnique({ where: { id } });
      if (existingId) {
        return { status: "error", error: "کد مدرسه تکراری است" };
      }
    }

    // ۲. سال تحصیلی فعال
    const activeAcademicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
      orderBy: { id: "desc" },
    });

    if (!activeAcademicYear) {
      return { status: "error", error: "سال تحصیلی فعالی در سیستم یافت نشد" };
    }

    // ۳. اعتبارسنجی دوره تحصیلی
    if (!doreTahsiliId) {
      return { status: "error", error: "دوره تحصیلی الزامی است" };
    }

    const doreh = await prisma.doreTahsili.findUnique({
      where: { id: doreTahsiliId },
    });
    if (!doreh) {
      return { status: "error", error: "دوره انتخاب شده وجود ندارد" };
    }

    // ۴. اعتبارسنجی نوبت مخالف
    if (oppositeSchoolId) {
      if (oppositeSchoolId === id) {
        return {
          status: "error",
          error: "یک مدرسه نمی‌تواند نوبت مخالف خودش باشد",
        };
      }
      const opposite = await prisma.school.findUnique({
        where: { id: oppositeSchoolId },
      });
      if (!opposite) {
        return { status: "error", error: "مدرسه نوبت مخالف یافت نشد" };
      }
    }

    // ۵. ساخت مدرسه + رابطه دوطرفه در یک تراکنش
    const result = await prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          id,
          title,
          subTitle,
          modirName,
          isActive,
          sex,
          schoolType,
          doreTahsili: { connect: { id: doreTahsiliId } },
          ...(oppositeSchoolId
            ? { oppositeSchool: { connect: { id: oppositeSchoolId } } }
            : {}),
        },
        include: { doreTahsili: true, oppositeSchool: true },
      });

      if (oppositeSchoolId) {
        await tx.school.update({
          where: { id: oppositeSchoolId },
          data: { oppositeSchoolId: id },
        });
      }

      return school;
    });

    // ۶. ایجاد کاربر مدیر
    const email = `${id}@lms.local`.toLowerCase();

    try {
      await auth.api.signUpEmail({
        headers: await headers(),
        body: {
          email,
          password: id.toString(),
          firstName: title,
          lastName: "مدیر",
          name: `${title} - مدیر`,
        },
      });
    } catch (authError) {
      // پاک‌سازی: مدرسه حذف می‌شود، B.oppositeSchoolId خودکار NULL می‌شود
      await prisma.school.delete({ where: { id } }).catch(() => {});
      console.error("AUTH_SIGNUP_ERROR", authError);
      return {
        status: "error",
        error: "خطا در ایجاد حساب کاربری مدرسه. عملیات لغو شد.",
      };
    }

    // ۷. پیدا کردن کاربر
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      await prisma.school.delete({ where: { id } }).catch(() => {});
      return { status: "error", error: "حساب کاربری ایجاد شد اما یافت نشد!" };
    }

    // ۸. تغییر role به admin
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "admin" },
    });

    // ۹. ثبت Assignment
    try {
      await prisma.userAssignment.create({
        data: {
          userId: user.id,
          schoolId: id,
          academicYearId: activeAcademicYear.id,
          role: SchoolRole.MANAGER,
        },
      });
    } catch (assignError) {
      console.error("ASSIGNMENT_ERROR", assignError);
      // پاک‌سازی: مدرسه حذف می‌شود (کاربر باقی می‌ماند ولی بدون دسترسی)
      await prisma.school.delete({ where: { id } }).catch(() => {});
      return {
        status: "error",
        error: "خطا در ثبت دسترسی مدیر. عملیات لغو شد.",
      };
    }

    revalidatePath("/dashboard/master/school");
    return { status: "success", data: result };
  } catch (error) {
    console.error("CREATE_SCHOOL_ERROR", error);
    return { status: "error", error: "خطا در ثبت مدرسه" };
  }
}

// ویرایش مدرسه
export async function updateSchoolAction(
  data: SchoolSchema,
): Promise<ActionResult<School>> {
  try {
    const {
      id,
      title,
      subTitle,
      modirName,
      isActive,
      sex,
      schoolType,
      doreTahsiliId,
      oppositeSchoolId,
    } = data;

    if (!id) {
      return { status: "error", error: "کد مدرسه الزامی است" };
    }

    // ۱. بررسی وجود مدرسه + خواندن نوبت مخالف قبلی
    const existing = await prisma.school.findUnique({
      where: { id },
      select: { id: true, oppositeSchoolId: true },
    });

    if (!existing) {
      return { status: "error", error: "مدرسه مورد نظر وجود ندارد" };
    }

    // ۲. اعتبارسنجی دوره تحصیلی
    if (doreTahsiliId) {
      const doreh = await prisma.doreTahsili.findUnique({
        where: { id: doreTahsiliId },
      });
      if (!doreh) {
        return { status: "error", error: "دوره انتخاب شده وجود ندارد" };
      }
    }

    // ۳. اعتبارسنجی نوبت مخالف
    if (oppositeSchoolId) {
      if (oppositeSchoolId === id) {
        return {
          status: "error",
          error: "یک مدرسه نمی‌تواند نوبت مخالف خودش باشد",
        };
      }

      const opposite = await prisma.school.findUnique({
        where: { id: oppositeSchoolId },
      });

      if (!opposite) {
        return { status: "error", error: "مدرسه نوبت مخالف یافت نشد" };
      }
    }

    // ۴. نوبت مخالف قبلی (برای پاک‌سازی رابطه قدیمی)
    const oldOppositeId = existing.oppositeSchoolId;

    // ۵. تمام عملیات در یک تراکنش اتمیک
    const result = await prisma.$transaction(async (tx) => {
      // ۵.۱ به‌روزرسانی خود مدرسه
      const updated = await tx.school.update({
        where: { id },
        data: {
          title,
          subTitle,
          modirName,
          isActive,
          sex,
          schoolType,
          doreTahsili: {
            connect: { id: doreTahsiliId ?? 1 },
          },
          ...(oppositeSchoolId
            ? { oppositeSchool: { connect: { id: oppositeSchoolId } } }
            : { oppositeSchool: { disconnect: true } }),
        },
        include: {
          doreTahsili: true,
          oppositeSchool: true,
        },
      });

      // ۵.۲ اگر نوبت مخالف قبلی وجود داشت و عوض شده،
      //     طرف قدیمی را NULL کن
      if (oldOppositeId && oldOppositeId !== oppositeSchoolId) {
        await tx.school.update({
          where: { id: oldOppositeId },
          data: { oppositeSchoolId: null },
        });
      }

      // ۵.۳ رابطه دوطرفه با نوبت مخالف جدید
      if (oppositeSchoolId) {
        await tx.school.update({
          where: { id: oppositeSchoolId },
          data: { oppositeSchoolId: id },
        });
      }

      return updated;
    });

    revalidatePath("/dashboard/master/school");
    return { status: "success", data: result };
  } catch (error) {
    console.error("UPDATE_SCHOOL_ERROR", error);
    return { status: "error", error: "خطا در ویرایش مدرسه" };
  }
}

// حذف مدرسه
export async function deleteSchoolAction(
  id: number,
): Promise<ActionResult<School>> {
  try {
    const existing = await prisma.school.findUnique({ where: { id } });
    if (!existing) {
      return { status: "error", error: "مدرسه مورد نظر وجود ندارد" };
    }

    const result = await prisma.school.delete({
      where: { id },
    });

    revalidatePath("/dashboard/master/school");
    return { status: "success", data: result };
  } catch (error) {
    console.error(error);
    return { status: "error", error: "خطا در حذف مدرسه" };
  }
}

// لیست مدارس برای جدول
export async function getSchools(
  page: number,
  pageSize: number,
  options: ListOptions,
): Promise<{ items: School[]; total: number }> {
  return getTableData<School>(prisma.school, columns, page, pageSize, {
    ...options,
    extraInclude: {
      doreTahsili: true,
    },
  });
}

// لیست دوره‌ها برای Select
export async function getAllDoreha() {
  try {
    const doreha = await prisma.doreTahsili.findMany({
      orderBy: { title: "asc" },
    });
    return { status: "success", data: doreha };
  } catch (error) {
    console.error(error);
    return { status: "error", error: "خطا در دریافت لیست دوره‌ها" };
  }
}
// ==========================================
// ریست کلمه عبور مدیر مدرسه
// ==========================================
export async function resetSchoolManagerPassword(
  schoolId: number,
): Promise<ActionResult<{ message: string; newPassword: string }>> {
  try {
    const managerAssignment = await prisma.userAssignment.findFirst({
      where: {
        schoolId,
        role: SchoolRole.MANAGER,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        school: {
          select: { id: true, title: true },
        },
      },
    });

    if (!managerAssignment) {
      return {
        status: "error",
        error: "مدیری برای این مدرسه ثبت نشده است.",
      };
    }

    const manager = managerAssignment.user;
    let newPassword = String(schoolId);

    // اگر کمتر از ۸ کاراکتر بود
    if (newPassword.length < 8) {
      newPassword = newPassword.padEnd(8, "0");
    }

    console.log(
      "🔑 Changing password for user:",
      manager.id,
      "to:",
      newPassword,
    );

    // ⬅️ headers را پاس بده
    const result = await auth.api.setUserPassword({
      headers: await headers(),
      body: {
        userId: manager.id,
        newPassword,
      },
    });

    console.log("✅ Password changed successfully");

    revalidatePath("/dashboard/master/school");

    return {
      status: "success",
      data: {
        message: `کلمه عبور مدیر مدرسه "${managerAssignment.school.title}" با موفقیت به ${newPassword} تغییر کرد.`,
        newPassword,
      },
    };
  } catch (error: any) {
    console.error("❌ RESET_ERROR:", error);
    console.error("   message:", error?.message);
    console.error("   status:", error?.status);
    console.error("   body:", error?.body);

    if (error?.status === "UNAUTHORIZED") {
      return {
        status: "error",
        error:
          "شما دسترسی لازم برای این عملیات را ندارید. لطفاً دوباره وارد شوید.",
      };
    }

    return {
      status: "error",
      error: `خطا در ریست کلمه عبور: ${error?.message || "نامشخص"}`,
    };
  }
}

export async function getOppositeSchoolKlasses(): Promise<
  ActionResult<{
    school: { id: number; title: string } | null;
    klasses: Array<{
      id: string;
      title: string;
      payeId: number;
      reshtehTahsiliId: number;
      schoolId: number;
      academicYearId: number;
      paye: { id: number; title: string } | null;
      reshtehTahsili: { id: number; title: string } | null;
    }>;
  }>
> {
  try {
    const scope = await getScope(PERMISSIONS.MANAGE_STUDENTS);
    if (isScopeError(scope)) {
      return { status: "error", error: scope.error };
    }

    const { schoolId, academicYearId } = scope;

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        oppositeSchoolId: true,
        oppositeSchool: {
          select: { id: true, title: true },
        },
      },
    });

    if (!school?.oppositeSchoolId) {
      return {
        status: "error",
        error: "برای این مدرسه نوبت مخالف تعریف نشده است",
      };
    }

    const klasses = await prisma.klass.findMany({
      where: {
        schoolId: school.oppositeSchoolId,
        academicYearId,
      },
      include: {
        paye: { select: { id: true, title: true } },
        reshtehTahsili: { select: { id: true, title: true } },
      },
      orderBy: [{ payeId: "asc" }, { title: "asc" }],
    });

    return {
      status: "success",
      data: {
        school: school.oppositeSchool,
        klasses: klasses.map((k) => ({
          id: k.id,
          title: k.title,
          payeId: k.payeId,
          reshtehTahsiliId: k.reshtehTahsiliId,
          schoolId: k.schoolId,
          academicYearId: k.academicYearId,
          paye: k.paye,
          reshtehTahsili: k.reshtehTahsili,
        })),
      },
    };
  } catch (error) {
    console.error(error);
    return { status: "error", error: "خطا در دریافت کلاس‌های نوبت مخالف" };
  }
}
export async function getAllSchoolsForOpposite(
  excludeId?: number,
): Promise<
  | { status: "success"; data: { id: number; title: string }[] }
  | { status: "error"; error: string }
> {
  try {
    const schools = await prisma.school.findMany({
      where: excludeId ? { id: { not: excludeId } } : undefined,
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    });
    return { status: "success", data: schools };
  } catch (error) {
    console.error(error);
    return { status: "error", error: "خطا در دریافت لیست مدارس" };
  }
}
