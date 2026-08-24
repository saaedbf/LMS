"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/types/index";
import {
  getTableData,
  Column,
} from "@/components/widgets/Elements/table/table-utils2";
import { ListOptions } from "@/types/myTypes";
import { ReshtehTahsili } from "@prisma/client";

const columns: Column[] = [
  { field: "id", type: "number", searchable: true, sortable: true },
  { field: "title", type: "string", searchable: true, sortable: true },
];

export async function getAssignedReshtehs(
  dorehId: number,
  page: number,
  pageSize: number,
  options: ListOptions,
) {
  return getTableData<ReshtehTahsili>(
    prisma.reshtehTahsili,
    columns,
    page,
    pageSize,
    {
      ...options,
      // ✅ حالا از extraWhere برای فیلتر کردن رابطه Many-to-Many استفاده می‌کنیم
      extraWhere: {
        doreTahsilis: {
          some: { id: dorehId },
        },
      },
    },
  );
}

export async function getAvailableReshtehs(dorehId: number, search?: string) {
  return prisma.reshtehTahsili.findMany({
    where: {
      NOT: {
        doreTahsilis: { some: { id: dorehId } },
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

export async function connectReshtehToDoreh(
  dorehId: number,
  reshtehId: number,
): Promise<ActionResult<null>> {
  try {
    await prisma.doreTahsili.update({
      where: { id: dorehId },
      data: {
        reshtehTahsilis: {
          connect: { id: reshtehId },
        },
      },
    });

    revalidatePath(`/dashboard/master/dorehTahsili/${dorehId}/reshtehs`);
    return { status: "success", data: null };
  } catch {
    return { status: "error", error: "خطا در برقراری ارتباط" };
  }
}

export async function disconnectReshtehFromDoreh(
  dorehId: number,
  reshtehId: number,
): Promise<ActionResult<null>> {
  try {
    await prisma.doreTahsili.update({
      where: { id: dorehId },
      data: {
        reshtehTahsilis: {
          disconnect: { id: reshtehId },
        },
      },
    });

    revalidatePath(`/dashboard/master/dorehTahsili/${dorehId}/reshtehs`);
    return { status: "success", data: null };
  } catch {
    return { status: "error", error: "خطا در قطع ارتباط" };
  }
}
