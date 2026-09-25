"use server";

import { prisma } from "@/lib/prisma";
import { getScope } from "@/lib/auth-helpers";
import { isScopeError } from "@/lib/auth-helpers-utils";
import { PERMISSIONS } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const TEACHER_ABSENCE_ROUTE = "/dashboard/manager/teacher-absence";

export type TeacherOption = {
  teacherId: string;
  fullName: string;
  nationalCode: string;
};

export async function getTeachersForAbsence(): Promise<{
  status: "success" | "error";
  data?: TeacherOption[];
  error?: string;
}> {
  try {
    const scope = await getScope(PERMISSIONS.MANAGE_ABSENCES_TEACHER);
    if (isScopeError(scope)) return { status: "error", error: scope.error };

    const teachers = await prisma.teacher.findMany({
      where: {
        assignments: {
          some: {
            schoolId: scope.schoolId,
            academicYearId: scope.academicYearId,
            isActive: true,
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        nationalCode: true,
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });

    return {
      status: "success",
      data: teachers.map((t) => ({
        teacherId: t.id,
        fullName: `${t.firstName} ${t.lastName}`,
        nationalCode: t.nationalCode,
      })),
    };
  } catch (error) {
    console.error(error);
    return { status: "error", error: "خطا در دریافت معلمان" };
  }
}

const createTeacherAbsencesSchema = z
  .object({
    teacherIds: z.array(z.string().min(1)).min(1, "حداقل یک معلم"),
    date: z.string().min(1, "تاریخ الزامی است"),
    isFullDay: z.boolean().default(false),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    reason: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.isFullDay) return true;
      return !!data.startTime && !!data.endTime;
    },
    { message: "در حالت ساعتی، ساعت شروع و پایان الزامی است" },
  )
  .refine(
    (data) => {
      if (data.isFullDay) return true;
      if (!data.startTime || !data.endTime) return true;
      return data.endTime > data.startTime;
    },
    { message: "ساعت پایان باید بعد از ساعت شروع باشد" },
  );

export async function createTeacherAbsencesAction(input: unknown) {
  try {
    const parsed = createTeacherAbsencesSchema.safeParse(input);
    if (!parsed.success) {
      return {
        status: "error" as const,
        error: parsed.error.issues[0]?.message || "داده نامعتبر",
      };
    }

    const scope = await getScope(PERMISSIONS.VIEW_ABSENCE_TEACHER);
    if (isScopeError(scope))
      return { status: "error" as const, error: scope.error };

    const { schoolId, academicYearId, username } = scope;
    const { teacherIds, date, isFullDay, startTime, endTime, reason } =
      parsed.data;

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return { status: "error" as const, error: "تاریخ نامعتبر است" };
    }

    const finalStartTime = isFullDay ? null : startTime || null;
    const finalEndTime = isFullDay ? null : endTime || null;

    const validTeachers = await prisma.teacher.findMany({
      where: {
        id: { in: teacherIds },
        assignments: {
          some: {
            schoolId,
            academicYearId,
            isActive: true,
          },
        },
      },
      select: { id: true },
    });

    if (validTeachers.length === 0) {
      return { status: "error" as const, error: "معلمی یافت نشد" };
    }

    const result = await prisma.$transaction(async (tx) => {
      let created = 0;
      let skipped = 0;

      for (const t of validTeachers) {
        const exists = await tx.teacherAbsence.findFirst({
          where: {
            teacherId: t.id,
            date: parsedDate,
            isFullDay,
            startTime: finalStartTime,
            endTime: finalEndTime,
          },
        });

        if (exists) {
          skipped++;
          continue;
        }

        await tx.teacherAbsence.create({
          data: {
            teacherId: t.id,
            schoolId,
            academicYearId,
            date: parsedDate,
            isFullDay,
            startTime: finalStartTime,
            endTime: finalEndTime,
            reason: reason || null,
            lastEditedByUsername: username,
          },
        });
        created++;
      }

      return { created, skipped };
    });

    revalidatePath(TEACHER_ABSENCE_ROUTE);
    return { status: "success" as const, data: result };
  } catch (error) {
    console.error(error);
    return { status: "error" as const, error: "خطا در ثبت غیبت معلمان" };
  }
}

export async function getTeacherAbsences(
  page: number,
  pageSize: number,
  options?: {
    sortField?: string;
    sortOrder?: "asc" | "desc";
    searchField?: string;
    searchValue?: string;
  },
) {
  const scope = await getScope(PERMISSIONS.MANAGE_ABSENCES_TEACHER);
  if (isScopeError(scope)) return { items: [], total: 0 };

  const { schoolId, academicYearId } = scope;

  const {
    sortField = "createdAt",
    sortOrder = "desc",
    searchField,
    searchValue,
  } = options ?? {};

  const skip = (page - 1) * pageSize;

  const where: any = { schoolId, academicYearId };

  if (searchField && searchValue?.trim()) {
    const val = searchValue.trim();
    if (searchField === "teacherName") {
      where.teacher = {
        OR: [
          { firstName: { contains: val, mode: "insensitive" } },
          { lastName: { contains: val, mode: "insensitive" } },
        ],
      };
    } else if (searchField === "date") {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        const start = new Date(d);
        start.setHours(0, 0, 0, 0);
        const end = new Date(d);
        end.setHours(23, 59, 59, 999);
        where.date = { gte: start, lte: end };
      }
    } else if (searchField === "reason") {
      where.reason = { contains: val, mode: "insensitive" };
    }
  }

  let orderBy: any = { createdAt: sortOrder };
  if (sortField === "teacherName") {
    orderBy = { teacher: { firstName: sortOrder } };
  } else if (sortField === "date") {
    orderBy = { date: sortOrder };
  }

  try {
    const [items, total] = await prisma.$transaction([
      prisma.teacherAbsence.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              nationalCode: true,
            },
          },
        },
      }),
      prisma.teacherAbsence.count({ where }),
    ]);

    return { items, total };
  } catch (error) {
    console.error(error);
    return { items: [], total: 0 };
  }
}

export async function deleteTeacherAbsenceAction(id: string) {
  try {
    const scope = await getScope(PERMISSIONS.MANAGE_ABSENCES_TEACHER);
    if (isScopeError(scope))
      return { status: "error" as const, error: scope.error };

    const absence = await prisma.teacherAbsence.findFirst({
      where: {
        id,
        schoolId: scope.schoolId,
        academicYearId: scope.academicYearId,
      },
    });

    if (!absence) return { status: "error" as const, error: "غیبت یافت نشد" };

    await prisma.teacherAbsence.delete({ where: { id } });

    revalidatePath(TEACHER_ABSENCE_ROUTE);
    return { status: "success" as const, data: { id } };
  } catch (error) {
    console.error(error);
    return { status: "error" as const, error: "خطا در حذف" };
  }
}

export async function updateTeacherAbsenceAction(input: {
  id: string;
  date?: string;
  isFullDay?: boolean;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
}) {
  try {
    const scope = await getScope(PERMISSIONS.MANAGE_ABSENCES_TEACHER);
    if (isScopeError(scope))
      return { status: "error" as const, error: scope.error };

    const absence = await prisma.teacherAbsence.findFirst({
      where: {
        id: input.id,
        schoolId: scope.schoolId,
        academicYearId: scope.academicYearId,
      },
    });

    if (!absence) return { status: "error" as const, error: "غیبت یافت نشد" };

    const data: any = {};

    if (input.date) {
      const d = new Date(input.date);
      if (isNaN(d.getTime()))
        return { status: "error" as const, error: "تاریخ نامعتبر" };
      data.date = d;
    }

    if (input.isFullDay !== undefined) {
      data.isFullDay = input.isFullDay;
      data.startTime = input.isFullDay ? null : input.startTime || null;
      data.endTime = input.isFullDay ? null : input.endTime || null;
    } else {
      if (input.startTime !== undefined) data.startTime = input.startTime;
      if (input.endTime !== undefined) data.endTime = input.endTime;
    }

    if (input.reason !== undefined) data.reason = input.reason || null;

    const result = await prisma.teacherAbsence.update({
      where: { id: input.id },
      data,
    });

    revalidatePath(TEACHER_ABSENCE_ROUTE);
    return { status: "success" as const, data: result };
  } catch (error) {
    console.error(error);
    return { status: "error" as const, error: "خطا در ویرایش" };
  }
}
