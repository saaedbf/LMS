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
    } = data;

    // اگر id را خودت دستی وارد می‌کنی و روی مدل @default(autoincrement()) نداری:
    if (id) {
      const existingId = await prisma.school.findUnique({ where: { id } });
      if (existingId) {
        return { status: "error", error: "کد مدرسه تکراری است" };
      }
    }
    const activeAcademicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
      orderBy: { id: "desc" }, // فرض بر این است که ID بزرگتر یعنی جدیدتر
    });

    if (!activeAcademicYear) {
      return { status: "error", error: "سال تحصیلی فعالی در سیستم یافت نشد" };
    }
    // اگر دوره الزامی است، وجود دوره را چک کن
    if (doreTahsiliId) {
      const doreh = await prisma.doreTahsili.findUnique({
        where: { id: doreTahsiliId },
      });
      if (!doreh) {
        return { status: "error", error: "دوره انتخاب شده وجود ندارد" };
      }
    }
    if (!doreTahsiliId) {
      return { status: "error", error: "دوره تحصیلی الزامی است" };
    }
    const selectedDoreTahsiliId: number = doreTahsiliId;
    const result = await prisma.school.create({
      data: {
        id,
        title,
        subTitle,
        modirName,
        isActive,
        sex,
        schoolType,
        doreTahsili: {
          connect: {
            id: selectedDoreTahsiliId,
          },
        },
      },
      include: {
        doreTahsili: true,
      },
    });
    // ۵. ایجاد کاربر با Better Auth (ایمیل و پسورد برابر با ID)
    const email = `${id}@lms.local`.toLowerCase();

    try {
      await auth.api.signUpEmail({
        body: {
          email,
          password: id.toString(), // پسورد برابر با کد مدرسه
          firstName: title,
          lastName: "مدیر",
          name: title,
        },
      });
    } catch (authError) {
      // اگر ساخت کاربر شکست خورد، مدرسه را حذف کن (Rollback)
      await prisma.school.delete({ where: { id } });
      console.error("AUTH_SIGNUP_ERROR", authError);
      return {
        status: "error",
        error: "خطا در ایجاد حساب کاربری مدرسه. عملیات لغو شد.",
      };
    }
    // ۶. پیدا کردن کاربر ساخته شده برای گرفتن ID او
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      // اگر کاربر پیدا نشد، باز هم مدرسه را حذف کن
      await prisma.school.delete({ where: { id } });
      return { status: "error", error: "حساب کاربری ایجاد شد اما یافت نشد!" };
    }

    // ۷. ثبت Assignment
    await prisma.userAssignment.create({
      data: {
        userId: user.id,
        schoolId: id,
        academicYearId: activeAcademicYear.id,
        role: SchoolRole.MANAGER,
      },
    });
    revalidatePath("/dashboard/master/school");
    return { status: "success", data: result };
  } catch (error) {
    console.error(error);
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
    } = data;

    if (!id) {
      return { status: "error", error: "کد مدرسه الزامی است" };
    }

    const existing = await prisma.school.findUnique({ where: { id } });
    if (!existing) {
      return { status: "error", error: "مدرسه مورد نظر وجود ندارد" };
    }

    if (doreTahsiliId) {
      const doreh = await prisma.doreTahsili.findUnique({
        where: { id: doreTahsiliId },
      });
      if (!doreh) {
        return { status: "error", error: "دوره انتخاب شده وجود ندارد" };
      }
    }

    const result = await prisma.school.update({
      where: { id },
      data: {
        title,
        subTitle,
        modirName,
        isActive,
        sex,
        schoolType,
        doreTahsiliId: doreTahsiliId ?? 1,
      },
      include: {
        doreTahsili: true,
      },
    });

    revalidatePath("/dashboard/master/school");
    return { status: "success", data: result };
  } catch (error) {
    console.error(error);
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
