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
import { ListOptions } from "@/types/myTypes";
import {
  Column,
  getTableData,
} from "@/components/widgets/Elements/table/table-utils2";

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

// ✅ تعریف ستون‌ها
const columns: Column[] = [
  { field: "title", type: "string", searchable: true, sortable: true },
];

// ✅ تابع  با استفاده از تابع عمومی
export async function getReshteTadrises(
  page: number,
  pageSize: number,
  options: ListOptions,
): Promise<{ items: ReshtehTadris[]; total: number }> {
  return getTableData<ReshtehTadris>(
    prisma.reshtehTadris,
    columns,
    page,
    pageSize,
    options,
  );
}
