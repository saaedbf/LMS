"use server";

import { prisma } from "@/lib/prisma";
import { getScope } from "@/lib/auth-helpers";
import { isScopeError } from "@/lib/auth-helpers-utils";
import { PERMISSIONS } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/types/index";
import {
  getTableData,
  Column,
} from "@/components/widgets/Elements/table/table-utils2";
import { ListOptions } from "@/types/myTypes";

const columns: Column[] = [
  { field: "id", type: "string", searchable: true, sortable: true },
  { field: "title", type: "string", searchable: true, sortable: true },
  {
    field: "paye.title",
    type: "string",
    searchable: true,
    sortable: true,
    relation: { model: "paye", field: "title" },
  },
  {
    field: "reshtehTahsili.title",
    type: "string",
    searchable: true,
    sortable: true,
    relation: { model: "reshtehTahsili", field: "title" },
  },
];

export async function getSchoolKlasses(
  schoolId: number,
  academicYearId: number,
  page: number,
  pageSize: number,
  options: ListOptions,
) {
  return getTableData<any>(prisma.klass, columns, page, pageSize, {
    ...options,
    extraWhere: { schoolId, academicYearId },
    extraInclude: { paye: true, reshtehTahsili: true },
  });
}

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

export async function createKlass(
  title: string,
  schoolId: number,
  academicYearId: number,
  payeId: number,
  reshtehTahsiliId: number,
): Promise<ActionResult<null>> {
  const scope = await getScope(PERMISSIONS.MANAGE_CLASSES);
  if (isScopeError(scope)) {
    return { status: "error", error: scope.error };
  }

  try {
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

    revalidatePath("/dashboard/manager/classes");
    return { status: "success", data: null };
  } catch (error) {
    console.error(error);
    return { status: "error", error: "خطا در ثبت کلاس جدید" };
  }
}

export async function updateKlass(
  klassId: string,
  newTitle: string,
  schoolId: number,
): Promise<ActionResult<null>> {
  const scope = await getScope(PERMISSIONS.MANAGE_CLASSES);
  if (isScopeError(scope)) {
    return { status: "error", error: scope.error };
  }

  try {
    const klass = await prisma.klass.findUnique({ where: { id: klassId } });
    if (!klass || klass.schoolId !== schoolId) {
      return { status: "error", error: "کلاس مورد نظر یافت نشد" };
    }

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

    revalidatePath("/dashboard/manager/classes");
    return { status: "success", data: null };
  } catch (error) {
    console.error(error);
    return { status: "error", error: "خطا در ویرایش کلاس" };
  }
}

export async function deleteKlass(
  klassId: string,
  schoolId: number,
): Promise<ActionResult<null>> {
  const scope = await getScope(PERMISSIONS.MANAGE_CLASSES);
  if (isScopeError(scope)) {
    return { status: "error", error: scope.error };
  }

  try {
    const klass = await prisma.klass.findUnique({
      where: { id: klassId },
    });

    if (!klass || klass.schoolId !== schoolId) {
      return {
        status: "error",
        error: "کلاس مورد نظر یافت نشد یا دسترسی مجاز نیست",
      };
    }

    const studentCount = await prisma.studentEnrollment.count({
      where: { klassId },
    });

    if (studentCount > 0) {
      return {
        status: "error",
        error: `این کلاس ${studentCount} دانش‌آموز دارد. ابتدا دانش‌آموزان را از کلاس حذف یا به کلاس دیگری منتقل کنید.`,
      };
    }

    const classCourseCount = await prisma.classCourse.count({
      where: { klassId },
    });

    if (classCourseCount > 0) {
      return {
        status: "error",
        error: `این کلاس ${classCourseCount} تخصیص معلم دارد. ابتدا از صفحه "تخصیص معلم به کلاس" تخصیص‌ها را حذف کنید.`,
      };
    }

    await prisma.klass.delete({
      where: { id: klassId },
    });

    revalidatePath("/dashboard/manager/classes");
    return { status: "success", data: null };
  } catch (error) {
    console.error("DELETE_KLASS_ERROR", error);
    return { status: "error", error: "خطا در حذف کلاس" };
  }
}
