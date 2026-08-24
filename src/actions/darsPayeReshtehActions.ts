"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/types/index";
import {
  getTableData,
  Column,
} from "@/components/widgets/Elements/table/table-utils2";
import { ListOptions } from "@/types/myTypes";

// تعریف ستون‌های قابل جستجو و مرتب‌سازی
const columns: Column[] = [
  { field: "id", type: "string", searchable: true, sortable: true },
  { field: "units", type: "number", searchable: true, sortable: true },

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
    field: "reshtehTadris.title",
    type: "string",
    searchable: true,
    sortable: true,
    relation: {
      model: "reshtehTadris",
      field: "title",
    },
  },
];

export async function getAssignedDars(
  reshtehTahsiliId: number,
  page: number,
  pageSize: number,
  options: ListOptions,
) {
  // گرفتن داده‌های جدول واسط به همراه ارتباطات آن‌ها
  return getTableData<any>(prisma.darsPayeReshteh, columns, page, pageSize, {
    ...options,
    extraWhere: {
      reshtehTahsiliId: reshtehTahsiliId,
    },
    extraInclude: {
      paye: true,
      reshtehTadris: true,
    },
  });
}

// واکشی دروسی که هنوز برای این پایه خاص در این رشته تعریف نشده‌اند
export async function getAvailableDars(
  reshtehTahsiliId: number,
  payeId: number,
  search?: string,
) {
  if (!payeId) return [];

  return prisma.reshtehTadris.findMany({
    where: {
      NOT: {
        darsPayeReshteh: {
          some: {
            reshtehTahsiliId: reshtehTahsiliId,
            payeId: payeId,
          },
        },
      },
      ...(search
        ? {
            title: {
              contains: search,
            },
          }
        : {}),
    },
    orderBy: { title: "asc" },
    take: 100,
  });
}

// ثبت درس برای پایه و رشته مشخص
export async function connectDarsToReshteh(
  reshtehTahsiliId: number,
  payeId: number,
  reshtehTadrisId: string,
  units: number,
): Promise<ActionResult<null>> {
  try {
    await prisma.darsPayeReshteh.create({
      data: {
        reshtehTahsiliId,
        payeId,
        reshtehTadrisId,
        units,
      },
    });

    revalidatePath(
      `/dashboard/master/reshtehTahsili/${reshtehTahsiliId}/courses`,
    );
    return { status: "success", data: null };
  } catch (error) {
    console.error(error);
    return { status: "error", error: "خطا در برقراری ارتباط و ثبت درس" };
  }
}

// حذف رابطه درس از پایه و رشته
export async function disconnectDarsFromReshteh(
  darsPayeReshtehId: string,
  reshtehTahsiliId: number,
): Promise<ActionResult<null>> {
  try {
    await prisma.darsPayeReshteh.delete({
      where: { id: darsPayeReshtehId },
    });

    revalidatePath(
      `/dashboard/master/reshtehTahsili/${reshtehTahsiliId}/courses`,
    );
    return { status: "success", data: null };
  } catch (error) {
    console.error(error);
    return { status: "error", error: "خطا در قطع ارتباط درس" };
  }
}
