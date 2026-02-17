"use server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "./authActions";
import { CreateDorehSchema } from "@/lib/schemas/deorehSchemas";
import { ActionResult } from "@/types/index";
import { DoreTahsili } from "@prisma/client";

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
    return { status: "success", data: result };
  } catch (error) {
    console.log(error);
    return { status: "error", error: " خطا در عملیات " };
  }
}
