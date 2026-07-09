/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { prisma } from "@/lib/prisma";
// import { getAuthUserId } from "./authActions";
import { ReshtehTahsiliSchema } from "@/lib/schemas/reshtehTahsiliSchemas";
import { ActionResult } from "@/types/index";
import { ReshtehTahsili } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  buildOrderBy,
  buildSafeWhere,
} from "@/components/widgets/Elements/table/table-utils";

export async function CreateReshtehTahiliAction(
  data: ReshtehTahsiliSchema,
): Promise<ActionResult<ReshtehTahsili>> {
  try {
    // const sourceUserId = await getAuthUserId();
    // if (!sourceUserId) throw new Error("No user");
    const { id, title } = data;

    const existing = await prisma.reshtehTahsili.findUnique({
      where: { id },
    });
    if (existing)
      return { status: "error", error: " کد رشته تحصیلی تکراری است" };
    const result = await prisma.reshtehTahsili.create({
      data: {
        id,
        title,
      },
    });
    revalidatePath("/dashboard/manager/reshteTahsili");
    return { status: "success", data: result };
  } catch (error) {
    console.log(error);
    return { status: "error", error: " خطا در عملیات " };
  }
}
export async function updateReshtehTahiliAction(
  data: ReshtehTahsiliSchema,
): Promise<ActionResult<ReshtehTahsili>> {
  try {
    // const sourceUserId = await getAuthUserId();
    // if (!sourceUserId) throw new Error("No user");
    const { id, title } = data;
    const existing = await prisma.reshtehTahsili.findUnique({
      where: { id },
    });
    if (!existing)
      return { status: "error", error: " کد رشته تحصیلی وجود ندارد" };
    const result = await prisma.reshtehTahsili.update({
      where: { id },
      data: {
        id,
        title,
      },
    });
    revalidatePath("/dashboard/manager/reshteTahsili");
    return { status: "success", data: result };
  } catch (error) {
    console.log(error);
    return { status: "error", error: " خطا در عملیات " };
  }
}
export async function DeleteReshteTahiliAction(
  id: number,
): Promise<ActionResult<ReshtehTahsili>> {
  try {
    // const sourceUserId = await getAuthUserId();
    // if (!sourceUserId) throw new Error("No user");
    console.log(id);
    const existing = await prisma.reshtehTahsili.findUnique({
      where: { id },
    });
    console.log(existing);
    if (!existing)
      return { status: "error", error: " کد رشته تحصیلی وجود ندارد است" };
    const result = await prisma.reshtehTahsili.delete({
      where: {
        id,
      },
    });
    revalidatePath("/dashboard/manager/reshteTahsili");
    return { status: "success", data: result };
  } catch (error) {
    console.log(error);
    return { status: "error", error: " خطا در عملیات " };
  }
}
const Columns = [
  { field: "id", type: "number", searchable: true, sortable: true },
  { field: "title", type: "string", searchable: true, sortable: true },
] as const;
export async function getReshteTahsilis(
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
    Columns,
    options.searchField,
    options.searchValue,
  );

  const orderBy = buildOrderBy(Columns, options.sortField, options.sortOrder);

  const [items, total] = await Promise.all([
    prisma.reshtehTahsili.findMany({
      where: where as any,
      orderBy: orderBy as any,
      skip,
      take: pageSize,
    }),
    prisma.reshtehTahsili.count({ where }),
  ]);

  return { items, total };
}
