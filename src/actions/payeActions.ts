"use server";
import { CreatePayeSchema } from "./../lib/schemas/payeSchemas";
import { prisma } from "@/lib/prisma";
// import { getAuthUserId } from "./authActions";
import { createPayeSchema } from "@/lib/schemas/payeSchemas";
import { ActionResult } from "@/types/index";
import { Paye } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  Column,
  getTableData,
} from "@/components/widgets/Elements/table/table-utils2";
export async function createPayeAction(
  data: CreatePayeSchema,
): Promise<ActionResult<Paye>> {
  try {
    // const sourceUserId = await getAuthUserId();
    // if (!sourceUserId) throw new Error("No user");
    const { id, title } = data;

    const existing = await prisma.paye.findUnique({
      where: { id },
    });
    if (existing) return { status: "error", error: " کد پایه تکراری است" };
    const result = await prisma.paye.create({
      data: {
        id,
        title,
      },
    });
    revalidatePath("/dashboard/manager/paye");
    return { status: "success", data: result };
  } catch (error) {
    console.log(error);
    return { status: "error", error: " خطا در عملیات " };
  }
}
export async function updatePayeAction(
  data: CreatePayeSchema,
): Promise<ActionResult<Paye>> {
  try {
    // const sourceUserId = await getAuthUserId();
    // if (!sourceUserId) throw new Error("No user");
    const { id, title } = data;
    const existing = await prisma.paye.findUnique({
      where: { id },
    });
    if (!existing) return { status: "error", error: " کد پایه وجود ندارد" };
    const result = await prisma.paye.update({
      where: { id },
      data: {
        id,
        title,
      },
    });
    revalidatePath("/dashboard/manager/paye");
    return { status: "success", data: result };
  } catch (error) {
    console.log(error);
    return { status: "error", error: " خطا در عملیات " };
  }
}
export async function DeletePayeAction(
  id: number,
): Promise<ActionResult<Paye>> {
  try {
    // const sourceUserId = await getAuthUserId();
    // if (!sourceUserId) throw new Error("No user");
    console.log(id);
    const existing = await prisma.paye.findUnique({
      where: { id },
    });
    console.log(existing);
    if (!existing) return { status: "error", error: " کد پایه وجود ندارد است" };
    const result = await prisma.paye.delete({
      where: {
        id,
      },
    });
    revalidatePath("/dashboard/manager/paye");
    return { status: "success", data: result };
  } catch (error) {
    console.log(error);
    return { status: "error", error: " خطا در عملیات " };
  }
}
const columns: Column[] = [
  { field: "id", type: "number", searchable: true, sortable: true },
  { field: "title", type: "string", searchable: true, sortable: true },
] as const;
export async function getPayes(
  page: number,
  pageSize: number,
  options: {
    sortField?: string;
    sortOrder?: "asc" | "desc";
    searchField?: string;
    searchValue?: string;
  },
): Promise<{ items: Paye[]; total: number }> {
  return getTableData<Paye>(prisma.paye, columns, page, pageSize, options);
}
