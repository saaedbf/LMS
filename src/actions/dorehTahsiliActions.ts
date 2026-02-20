"use server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "./authActions";
import { CreateDorehSchema } from "@/lib/schemas/deorehSchemas";
import { ActionResult } from "@/types/index";
import { DoreTahsili } from "@prisma/client";
import { revalidatePath } from "next/cache";

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
export async function getDoreTahsilis() {
  // const session = await auth();
  // if (!session) return null;
  try {
    return prisma.doreTahsili.findMany();
  } catch (error) {
    console.log(error);
  }
}
