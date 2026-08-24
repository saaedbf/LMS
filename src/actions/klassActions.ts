"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/types/index";
import {
  getTableData,
  Column,
} from "@/components/widgets/Elements/table/table-utils2";
import { ListOptions } from "@/types/myTypes";

// تعریف ستون‌های جدول کلاس‌ها برای جستجو و مرتب‌سازی
const columns: Column[] = [
  { field: "id", type: "string", searchable: true, sortable: true },
  { field: "title", type: "string", searchable: true, sortable: true },
  {
    field: "paye.title",
    type: "string",
    searchable: true,
    sortable: true,
    relation: {
      model: "paye",
      field: "title",
    },
  },
  {
    field: "reshtehTahsili.title",
    type: "string",
    searchable: true,
    sortable: true,
    relation: {
      model: "reshtehTahsili",
      field: "title",
    },
  },
];

// واکشی کلاس‌های مدرسه در سال تحصیلی مشخص
export async function getSchoolKlasses(
  schoolId: number,
  academicYearId: number,
  page: number,
  pageSize: number,
  options: ListOptions,
) {
  return getTableData<any>(prisma.klass, columns, page, pageSize, {
    ...options,
    extraWhere: {
      schoolId,
      academicYearId,
    },
    extraInclude: {
      paye: true,
      reshtehTahsili: true,
    },
  });
}

// واکشی پایه‌ها و رشته‌های مرتبط با دوره تحصیلی مدرسه
export async function getSchoolDoreOptions(schoolId: number) {
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: {
      doreTahsili: {
        select: {
          payes: { select: { id: true, title: true }, orderBy: { id: "asc" } },
          reshtehTahsilis: {
            select: { id: true, title: true },
            orderBy: { id: "asc" },
          },
        },
      },
    },
  });

  if (!school || !school.doreTahsili) {
    return { payes: [], reshtehs: [] };
  }

  return {
    payes: school.doreTahsili.payes,
    reshtehs: school.doreTahsili.reshtehTahsilis,
  };
}

// ثبت کلاس جدید
export async function createKlass(
  title: string,
  schoolId: number,
  academicYearId: number,
  payeId: number,
  reshtehTahsiliId: number,
): Promise<ActionResult<null>> {
  try {
    // بررسی تکراری نبودن کلاس در مدرسه و سال تحصیلی
    const existing = await prisma.klass.findFirst({
      where: {
        title: title.trim(),
        schoolId,
        academicYearId,
        payeId,
        reshtehTahsiliId,
      },
    });

    if (existing) {
      return {
        status: "error",
        error: "کلاسی با این نام قبلاً برای این پایه و رشته ثبت شده است",
      };
    }

    await prisma.klass.create({
      data: {
        title: title.trim(),
        schoolId,
        academicYearId,
        payeId,
        reshtehTahsiliId,
      },
    });

    revalidatePath(`/dashboard/manager/classes`);
    return { status: "success", data: null };
  } catch (error) {
    console.error(error);
    return { status: "error", error: "خطا در ثبت کلاس جدید" };
  }
}

// ویرایش عنوان کلاس (تنها دکمه ویرایش مورد نیاز)
export async function updateKlass(
  klassId: string,
  newTitle: string,
  schoolId: number,
): Promise<ActionResult<null>> {
  try {
    const klass = await prisma.klass.findUnique({ where: { id: klassId } });
    if (!klass || klass.schoolId !== schoolId) {
      return { status: "error", error: "کلاس مورد نظر یافت نشد" };
    }

    // بررسی عدم تکراری بودن نام جدید با سایر کلاس‌های همان پایه/رشته مدرسه
    const existing = await prisma.klass.findFirst({
      where: {
        id: { not: klassId },
        title: newTitle.trim(),
        schoolId: klass.schoolId,
        academicYearId: klass.academicYearId,
        payeId: klass.payeId,
        reshtehTahsiliId: klass.reshtehTahsiliId,
      },
    });

    if (existing) {
      return { status: "error", error: "کلاسی با این نام قبلاً تعریف شده است" };
    }

    await prisma.klass.update({
      where: { id: klassId },
      data: { title: newTitle.trim() },
    });

    revalidatePath(`/dashboard/manager/classes`);
    return { status: "success", data: null };
  } catch (error) {
    console.error(error);
    return { status: "error", error: "خطا در ویرایش کلاس" };
  }
}

// حذف کلاس
export async function deleteKlass(
  klassId: string,
  schoolId: number,
): Promise<ActionResult<null>> {
  try {
    const klass = await prisma.klass.findUnique({ where: { id: klassId } });
    if (!klass || klass.schoolId !== schoolId) {
      return {
        status: "error",
        error: "کلاس مورد نظر یافت نشد یا دسترسی مجاز نیست",
      };
    }

    await prisma.klass.delete({
      where: { id: klassId },
    });

    revalidatePath(`/dashboard/manager/classes`);
    return { status: "success", data: null };
  } catch (error) {
    console.error(error);
    return { status: "error", error: "خطا در حذف کلاس" };
  }
}
