"use server";

import { prisma } from "@/lib/prisma";
import { getScope } from "@/lib/auth-helpers";
import { isScopeError } from "@/lib/auth-helpers-utils";
import { PERMISSIONS } from "@/lib/permissions";

export async function getKlassSchedule(klassId: string) {
  const scope = await getScope(PERMISSIONS.MANAGE_CLASSES);
  if (isScopeError(scope)) return { status: "error", error: scope.error };

  try {
    // ۱. بررسی اینکه کلاس متعلق به این مدرسه است
    const klass = await prisma.klass.findFirst({
      where: {
        id: klassId,
        schoolId: scope.schoolId,
        academicYearId: scope.academicYearId,
      },
      select: { id: true },
    });

    if (!klass) return { status: "error", error: "کلاس یافت نشد" };

    // ۲. گرفتن همه برنامه‌های دروس این کلاس
    const schedules = await prisma.classSchedule.findMany({
      where: {
        classCourse: {
          klassId: klassId,
        },
      },
      include: {
        classCourse: {
          include: {
            darsPayeReshteh: {
              include: { reshtehTadris: true },
            },
            teacher: true,
          },
        },
      },
    });

    // ۳. فرمت‌دهی برای فرانت‌اند
    const formatted = schedules.map((s) => ({
      day: s.day,
      bellIndex: s.bellIndex,
      isHalfBell: s.isHalfBell,
      darsTitle: s.classCourse.darsPayeReshteh.reshtehTadris.title,
      teacherName: s.classCourse.teacher
        ? `${s.classCourse.teacher.firstName} ${s.classCourse.teacher.lastName}`
        : "بدون معلم",
    }));

    return { status: "success", data: formatted };
  } catch (error) {
    console.error("GET_KLASS_SCHEDULE_ERROR", error);
    return { status: "error", error: "خطا در دریافت برنامه کلاس" };
  }
}
