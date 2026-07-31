"use server";

import { prisma } from "@/lib/prisma";
import { ActionResult } from "@/types/index";
import { revalidatePath } from "next/cache";

// ۱. دریافت لیست پایه‌های متصل به این دوره
export async function getAssignedPayes(dorehId: number) {
  return await prisma.paye.findMany({
    where: {
      doreTahsilis: { some: { id: dorehId } },
    },
  });
}

// ۲. دریافت لیست پایه‌هایی که هنوز به این دوره اضافه نشده‌اند (برای منوی افزودن)
export async function getAvailablePayes(dorehId: number) {
  return await prisma.paye.findMany({
    where: {
      NOT: {
        doreTahsilis: { some: { id: dorehId } },
      },
    },
  });
}

// ۳. افزودن یک پایه به دوره
export async function connectPayeToDoreh(
  dorehId: number,
  payeId: number,
): Promise<ActionResult<null>> {
  try {
    await prisma.doreTahsili.update({
      where: { id: dorehId },
      data: { payes: { connect: { id: payeId } } },
    });
    revalidatePath(`/dashboard/manager/dorehTahsili/${dorehId}/payes`);
    return { status: "success", data: null };
  } catch (e) {
    return { status: "error", error: "خطا در برقراری ارتباط" };
  }
}

// ۴. حذف ارتباط یک پایه از دوره
export async function disconnectPayeFromDoreh(
  dorehId: number,
  payeId: number,
): Promise<ActionResult<null>> {
  try {
    await prisma.doreTahsili.update({
      where: { id: dorehId },
      data: { payes: { disconnect: { id: payeId } } },
    });
    revalidatePath(`/dashboard/manager/dorehTahsili/${dorehId}/payes`);
    return { status: "success", data: null };
  } catch (e) {
    return { status: "error", error: "خطا در قطع ارتباط" };
  }
}
