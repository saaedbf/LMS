"use server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "./authActions";
import { CreateDorehSchema } from "@/lib/schemas/deorehSchemas";
import { ActionResult } from "@/types/index";
import { DoreTahsili } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  buildOrderBy,
  buildSafeWhere,
} from "@/components/widgets/Elements/table/table-utils";
const dorehColumns = [
  { field: "id", type: "number", searchable: true, sortable: true },
  { field: "title", type: "string", searchable: true, sortable: true },
] as const;
export async function createDorehTahiliAction(
  data: CreateDorehSchema,
): Promise<ActionResult<DoreTahsili>> {
  try {
    // const sourceUserId = await getAuthUserId();
    // if (!sourceUserId) throw new Error("No user");
    const { id, title } = data;
    console.log("Bi");
    const existing = await prisma.doreTahsili.findUnique({
      where: { id },
    });
    if (existing) return { status: "error", error: " کد دوره تکراری است" };
    const result = await prisma.doreTahsili.create({
      data: {
        id,
        title,
      },
    });
    revalidatePath("/dashboard/manager/dorehTahsili");
    return { status: "success", data: result };
  } catch (error) {
    console.log(error);
    return { status: "error", error: " خطا در عملیات " };
  }
}
export async function updateDorehTahiliAction(
  data: CreateDorehSchema,
): Promise<ActionResult<DoreTahsili>> {
  try {
    // const sourceUserId = await getAuthUserId();
    // if (!sourceUserId) throw new Error("No user");
    const { id, title } = data;
    const existing = await prisma.doreTahsili.findUnique({
      where: { id },
    });
    if (!existing) return { status: "error", error: " کد دوره وجود ندارد" };
    const result = await prisma.doreTahsili.update({
      where: { id },
      data: {
        id,
        title,
      },
    });
    revalidatePath("/dashboard/manager/dorehTahsili");
    return { status: "success", data: result };
  } catch (error) {
    console.log(error);
    return { status: "error", error: " خطا در عملیات " };
  }
}
export async function DeleteDorehTahiliAction(
  id: number,
): Promise<ActionResult<DoreTahsili>> {
  try {
    // const sourceUserId = await getAuthUserId();
    // if (!sourceUserId) throw new Error("No user");
    console.log(id);
    const existing = await prisma.doreTahsili.findUnique({
      where: { id },
    });
    console.log(existing);
    if (!existing) return { status: "error", error: " کد دوره وجود ندارد است" };
    const result = await prisma.doreTahsili.delete({
      where: {
        id,
      },
    });
    revalidatePath("/dashboard/manager/dorehTahsili");
    return { status: "success", data: result };
  } catch (error) {
    console.log(error);
    return { status: "error", error: " خطا در عملیات " };
  }
}

export async function getDoreTahsilis(
  page: number,
  pageSize: number,
  options: {
    sortField?: string;
    sortOrder?: "asc" | "desc";
    searchField?: string;
    searchValue?: string;
  },
) {
  const skip = (page - 1) * pageSize;

  const where = buildSafeWhere(
    dorehColumns,
    options.searchField,
    options.searchValue,
  );

  const orderBy = buildOrderBy(
    dorehColumns,
    options.sortField,
    options.sortOrder,
  );

  const [items, total] = await Promise.all([
    prisma.doreTahsili.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
    }),
    prisma.doreTahsili.count({ where }),
  ]);

  return { items, total };
}
