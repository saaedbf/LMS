"use server";
import { prisma } from "@/lib/prisma";
// import { getAuthUserId } from "./authActions";
import { OstanSchemas } from "@/lib/schemas/ostanSchemas";
import { ActionResult } from "@/types/index";
import { Ostan } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  getTableData,
  Column,
} from "@/components/widgets/Elements/table/table-utils2";

export async function createOstanAction(
  data: OstanSchemas,
): Promise<ActionResult<Ostan>> {
  try {
    // const sourceUserId = await getAuthUserId();
    // if (!sourceUserId) throw new Error("No user");
    const { id, title } = data;

    const existing = await prisma.ostan.findUnique({
      where: { id },
    });
    if (existing) return { status: "error", error: " کد استان تکراری است" };
    const result = await prisma.ostan.create({
      data: {
        id,
        title,
      },
    });
    revalidatePath("/dashboard/manager/ostan");
    return { status: "success", data: result };
  } catch (error) {
    console.log(error);
    return { status: "error", error: " خطا در عملیات " };
  }
}
export async function updateOstanAction(
  data: OstanSchemas,
): Promise<ActionResult<Ostan>> {
  try {
    // const sourceUserId = await getAuthUserId();
    // if (!sourceUserId) throw new Error("No user");
    const { id, title } = data;
    const existing = await prisma.ostan.findUnique({
      where: { id },
    });
    if (!existing) return { status: "error", error: " کد استان وجود ندارد" };
    const result = await prisma.ostan.update({
      where: { id },
      data: {
        id,
        title,
      },
    });
    revalidatePath("/dashboard/manager/ostan");
    return { status: "success", data: result };
  } catch (error) {
    console.log(error);
    return { status: "error", error: " خطا در عملیات " };
  }
}
export async function DeleteOstanAction(
  id: number,
): Promise<ActionResult<Ostan>> {
  try {
    // const sourceUserId = await getAuthUserId();
    // if (!sourceUserId) throw new Error("No user");
    console.log(id);
    const existing = await prisma.ostan.findUnique({
      where: { id },
    });
    console.log(existing);
    if (!existing)
      return { status: "error", error: " کد استان  وجود ندارد است" };
    const result = await prisma.ostan.delete({
      where: {
        id,
      },
    });
    revalidatePath("/dashboard/manager/ostan");
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
// ✅ تابع getRegions با استفاده از تابع عمومی
export async function getOstans(
  page: number,
  pageSize: number,
  options: {
    sortField?: string;
    sortOrder?: "asc" | "desc";
    searchField?: string;
    searchValue?: string;
  },
): Promise<{ items: Ostan[]; total: number }> {
  return getTableData<Ostan>(prisma.ostan, columns, page, pageSize, options);
}
