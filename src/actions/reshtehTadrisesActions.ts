/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { prisma } from "@/lib/prisma";
// import { getAuthUserId } from "./authActions";
import {
  CreateReshtehTadrisSchemas,
  UpdateReshtehTadrisSchemas,
} from "@/lib/schemas/reshtehTadrisSchemas";
import { ActionResult } from "@/types/index";
import { ReshtehTadris } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  buildOrderBy,
  buildSafeWhere,
} from "@/components/widgets/Elements/table/table-utils";

export async function CreateReshtehTadrisAction(
  data: CreateReshtehTadrisSchemas,
): Promise<ActionResult<ReshtehTadris>> {
  try {
    // const sourceUserId = await getAuthUserId();
    // if (!sourceUserId) throw new Error("No user");
    const { title } = data;

    const existing = await prisma.reshtehTadris.findUnique({
      where: { title },
    });
    if (existing)
      return { status: "error", error: " نام رشته تدریس تکراری است" };
    const result = await prisma.reshtehTadris.create({
      data: {
        title,
      },
    });
    revalidatePath("/dashboard/manager/reshteTadris");
    return { status: "success", data: result };
  } catch (error) {
    console.log(error);
    return { status: "error", error: " خطا در عملیات " };
  }
}
export async function updateReshtehTadrisAction(
  data: UpdateReshtehTadrisSchemas,
): Promise<ActionResult<ReshtehTadris>> {
  try {
    // const sourceUserId = await getAuthUserId();
    // if (!sourceUserId) throw new Error("No user");
    const { id, title } = data;
    const existing = await prisma.reshtehTadris.findUnique({
      where: { id },
    });
    if (!existing)
      return { status: "error", error: " کد رشته تدریس وجود ندارد" };
    const existingUniq = await prisma.reshtehTadris.findUnique({
      where: { title },
    });
    if (existingUniq)
      return { status: "error", error: " نام رشته تدریس تکراری است" };

    const result = await prisma.reshtehTadris.update({
      where: { id },
      data: {
        id,
        title,
      },
    });
    revalidatePath("/dashboard/manager/reshteTadris");
    return { status: "success", data: result };
  } catch (error) {
    console.log(error);
    return { status: "error", error: " خطا در عملیات " };
  }
}
export async function DeleteReshteTadrisAction(
  id: string,
): Promise<ActionResult<ReshtehTadris>> {
  try {
    // const sourceUserId = await getAuthUserId();
    // if (!sourceUserId) throw new Error("No user");
    console.log(id);
    const existing = await prisma.reshtehTadris.findUnique({
      where: { id },
    });
    console.log(existing);
    if (!existing)
      return { status: "error", error: " کد رشته تدریس وجود ندارد است" };
    const result = await prisma.reshtehTadris.delete({
      where: {
        id,
      },
    });
    revalidatePath("/dashboard/manager/reshteTadris");
    return { status: "success", data: result };
  } catch (error) {
    console.log(error);
    return { status: "error", error: " خطا در عملیات " };
  }
}
const Columns = [
  { field: "title", type: "string", searchable: true, sortable: true },
] as const;
export async function getReshteTadrises(
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
    prisma.reshtehTadris.findMany({
      where: where as any,
      orderBy: orderBy as any,
      skip,
      take: pageSize,
    }),
    prisma.reshtehTadris.count({ where }),
  ]);

  return { items, total };
}
