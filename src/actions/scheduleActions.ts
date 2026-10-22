"use server";

import { prisma } from "@/lib/prisma";
import { getScope } from "@/lib/auth-helpers";
import { isScopeError } from "@/lib/auth-helpers-utils";
import { PERMISSIONS } from "@/lib/permissions";
import { DayOfWeek } from "@prisma/client";
import { revalidatePath } from "next/cache";

// 1. گرفتن برنامه هفتگی یک درس
export async function getScheduleForClassCourse(classCourseId: string) {
  const scope = await getScope(PERMISSIONS.MANAGE_CLASS_COURSES);
  if (isScopeError(scope)) return { status: "error", error: scope.error };

  try {
    const schedules = await prisma.classSchedule.findMany({
      where: { classCourseId },
    });
    return { status: "success", data: schedules };
  } catch (error) {
    return { status: "error", error: "خطا در دریافت برنامه" };
  }
}

// 2. ذخیره برنامه هفتگی
export async function saveClassSchedule(
  classCourseId: string,
  schedules: { day: DayOfWeek; bellIndex: number; isHalfBell: boolean }[],
) {
  const scope = await getScope(PERMISSIONS.MANAGE_CLASS_COURSES);
  if (isScopeError(scope)) return { status: "error", error: scope.error };

  try {
    // پاک کردن برنامه قبلی و نوشتن برنامه جدید در یک تراکنش
    await prisma.$transaction([
      prisma.classSchedule.deleteMany({ where: { classCourseId } }),
      prisma.classSchedule.createMany({
        data: schedules.map((s) => ({
          classCourseId,
          day: s.day,
          bellIndex: s.bellIndex,
          isHalfBell: s.isHalfBell,
        })),
      }),
    ]);

    revalidatePath("/dashboard/manager/class-course");
    return { status: "success", data: true };
  } catch (error) {
    return { status: "error", error: "خطا در ذخیره برنامه" };
  }
}
