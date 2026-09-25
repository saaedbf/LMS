"use server";

import { prisma } from "@/lib/prisma";
import { getScope } from "@/lib/auth-helpers";
import { PERMISSIONS } from "@/lib/permissions";
import {
  createAbsencesSchema,
  CreateAbsencesSchema,
  updateAbsenceSchema,
  UpdateAbsenceSchema,
  updateAbsenceScheduleSchema,
  UpdateAbsenceScheduleSchema,
  deleteAbsenceSchema,
  DeleteAbsenceSchema,
} from "@/lib/schemas/absenceSchemas";
import { ActionResult } from "@/types/index";
import { ListOptions } from "@/types/myTypes";
import { AbsenceType, StudentAbsence } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { parseJalaliDate } from "@/lib/dateUtils";
import { isScopeError } from "@/lib/auth-helpers-utils";

const ABSENCE_ROUTE = "/dashboard/manager/absence";

export type AbsenceListItem = StudentAbsence & {
  studentEnrollment: {
    student: { id: string; firstName: string; lastName: string };
    paye: { id: number; title: string } | null;
    klass: { id: string; title: string } | null;
  };
};

export async function getAbsences(
  page: number,
  pageSize: number,
  options?: ListOptions,
): Promise<{ items: AbsenceListItem[]; total: number }> {
  const scope = await getScope(PERMISSIONS.MANAGE_ABSENCES);
  if (isScopeError(scope)) return { items: [], total: 0 };

  const { schoolId, academicYearId } = scope;

  const {
    sortField = "createdAt",
    sortOrder = "desc",
    searchField,
    searchValue,
  } = options ?? {};

  const skip = (page - 1) * pageSize;

  const where: any = {
    studentEnrollment: { schoolId, academicYearId },
  };

  if (searchField && searchValue?.trim()) {
    const val = searchValue.trim();

    switch (searchField) {
      case "studentName":
        where.studentEnrollment.student = {
          OR: [
            { firstName: { contains: val, mode: "insensitive" } },
            { lastName: { contains: val, mode: "insensitive" } },
          ],
        };
        break;
      case "paye":
        where.studentEnrollment.paye = {
          title: { contains: val, mode: "insensitive" },
        };
        break;
      case "klass":
        where.studentEnrollment.klass = {
          title: { contains: val, mode: "insensitive" },
        };
        break;
      case "absenceType": {
        const typeMap: { [key: string]: AbsenceType } = {
          موجه: "EXCUSED",
          غیرموجه: "UNEXCUSED",
          نامشخص: "UNKNOWN",
          excused: "EXCUSED",
          unexcused: "UNEXCUSED",
          unknown: "UNKNOWN",
        };
        const mappedType = typeMap[val.toLowerCase()] || typeMap[val];
        if (mappedType) where.absenceType = mappedType;
        break;
      }
      case "date": {
        const jalaliDate = parseJalaliDate(val);
        if (jalaliDate) {
          const startOfDay = new Date(jalaliDate);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(jalaliDate);
          endOfDay.setHours(23, 59, 59, 999);
          where.date = { gte: startOfDay, lte: endOfDay };
          break;
        }
        const dateObj = new Date(val);
        if (!isNaN(dateObj.getTime())) {
          const startOfDay = new Date(dateObj);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(dateObj);
          endOfDay.setHours(23, 59, 59, 999);
          where.date = { gte: startOfDay, lte: endOfDay };
        }
        break;
      }
      case "reason":
        where.reason = { contains: val, mode: "insensitive" };
        break;
    }
  }

  let orderBy: any = { [sortField]: sortOrder };

  switch (sortField) {
    case "studentName":
      orderBy = { studentEnrollment: { student: { firstName: sortOrder } } };
      break;
    case "paye":
      orderBy = { studentEnrollment: { paye: { title: sortOrder } } };
      break;
    case "klass":
      orderBy = { studentEnrollment: { klass: { title: sortOrder } } };
      break;
  }

  try {
    const [items, total] = await prisma.$transaction([
      prisma.studentAbsence.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          studentEnrollment: {
            include: {
              student: {
                select: { id: true, firstName: true, lastName: true },
              },
              paye: { select: { id: true, title: true } },
              klass: { select: { id: true, title: true } },
            },
          },
        },
      }),
      prisma.studentAbsence.count({ where }),
    ]);

    return { items: items as AbsenceListItem[], total };
  } catch (error) {
    console.error("getAbsences error:", error);
    return { items: [], total: 0 };
  }
}

export async function getAbsenceFilterOptions(): Promise<{
  status: "success" | "error";
  payes?: { id: number; title: string }[];
  klasses?: { id: string; title: string; payeId: number }[];
}> {
  try {
    const scope = await getScope(PERMISSIONS.MANAGE_ABSENCES);
    if (isScopeError(scope)) return { status: "error" };

    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        schoolId: scope.schoolId,
        academicYearId: scope.academicYearId,
      },
      select: {
        paye: { select: { id: true, title: true } },
        klass: { select: { id: true, title: true, payeId: true } },
      },
    });

    const payeMap = new Map<number, { id: number; title: string }>();
    const klassMap = new Map<
      string,
      { id: string; title: string; payeId: number }
    >();

    for (const e of enrollments) {
      if (e.paye) payeMap.set(e.paye.id, e.paye);
      if (e.klass) klassMap.set(e.klass.id, e.klass);
    }

    return {
      status: "success",
      payes: [...payeMap.values()].sort((a, b) => a.id - b.id),
      klasses: [...klassMap.values()].sort((a, b) =>
        a.title.localeCompare(b.title, "fa"),
      ),
    };
  } catch (error) {
    console.error(error);
    return { status: "error" };
  }
}

export type StudentOption = {
  enrollmentId: string;
  fullName: string;
  klassTitle: string;
  payeTitle: string;
};

export async function getStudentsForAbsence(filters: {
  payeId?: number;
  klassId?: string;
}): Promise<ActionResult<StudentOption[]>> {
  try {
    const scope = await getScope(PERMISSIONS.MANAGE_ABSENCES);
    if (isScopeError(scope)) return { status: "error", error: scope.error };

    const rows = await prisma.studentEnrollment.findMany({
      where: {
        schoolId: scope.schoolId,
        academicYearId: scope.academicYearId,
        ...(filters.payeId ? { payeId: filters.payeId } : {}),
        ...(filters.klassId ? { klassId: filters.klassId } : {}),
      },
      include: {
        student: { select: { firstName: true, lastName: true } },
        paye: { select: { title: true } },
        klass: { select: { title: true } },
      },
      orderBy: { student: { firstName: "asc" } },
    });

    return {
      status: "success",
      data: rows.map((r) => ({
        enrollmentId: r.id,
        fullName: `${r.student.firstName} ${r.student.lastName}`,
        klassTitle: r.klass?.title || "",
        payeTitle: r.paye?.title || "",
      })),
    };
  } catch (error) {
    console.error(error);
    return { status: "error", error: "خطا در دریافت دانش‌آموزان" };
  }
}

export async function createAbsencesAction(
  data: CreateAbsencesSchema,
): Promise<ActionResult<{ created: number; skipped: number }>> {
  try {
    const parsed = createAbsencesSchema.safeParse(data);
    if (!parsed.success) {
      return {
        status: "error",
        error: parsed.error.issues[0]?.message || "داده‌های ورودی نامعتبر است",
      };
    }

    const scope = await getScope(PERMISSIONS.MANAGE_ABSENCES);
    if (isScopeError(scope)) return { status: "error", error: scope.error };

    const { enrollmentIds, date, isFullDay, startTime, endTime } = parsed.data;
    const { schoolId, academicYearId } = scope;

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return { status: "error", error: "تاریخ نامعتبر است" };
    }

    const finalStartTime = isFullDay ? null : startTime || null;
    const finalEndTime = isFullDay ? null : endTime || null;

    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        id: { in: enrollmentIds },
        schoolId,
        academicYearId,
      },
      select: { id: true },
    });

    if (enrollments.length === 0) {
      return { status: "error", error: "دانش‌آموزی یافت نشد" };
    }

    const result = await prisma.$transaction(async (tx) => {
      let created = 0;
      let skipped = 0;

      for (const e of enrollments) {
        const exists = await tx.studentAbsence.findFirst({
          where: {
            studentEnrollmentId: e.id,
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

        await tx.studentAbsence.create({
          data: {
            studentEnrollmentId: e.id,
            date: parsedDate,
            isFullDay,
            startTime: finalStartTime,
            endTime: finalEndTime,
            absenceType: "UNKNOWN",
          },
        });
        created++;
      }

      return { created, skipped };
    });

    revalidatePath(ABSENCE_ROUTE);
    return { status: "success", data: result };
  } catch (error) {
    console.error(error);
    return { status: "error", error: "خطا در ثبت غیبت" };
  }
}

export async function updateAbsenceAction(
  data: UpdateAbsenceSchema,
): Promise<ActionResult<StudentAbsence>> {
  try {
    const parsed = updateAbsenceSchema.safeParse(data);
    if (!parsed.success) {
      return {
        status: "error",
        error: parsed.error.issues[0]?.message || "داده‌های ورودی نامعتبر است",
      };
    }

    const scope = await getScope(PERMISSIONS.MANAGE_ABSENCES);
    if (isScopeError(scope)) return { status: "error", error: scope.error };

    const absence = await prisma.studentAbsence.findFirst({
      where: {
        id: parsed.data.id,
        studentEnrollment: {
          schoolId: scope.schoolId,
          academicYearId: scope.academicYearId,
        },
      },
    });
    if (!absence) return { status: "error", error: "غیبت یافت نشد" };

    const result = await prisma.studentAbsence.update({
      where: { id: absence.id },
      data: {
        absenceType: parsed.data.absenceType,
        reason: parsed.data.reason || null,
      },
    });

    revalidatePath(ABSENCE_ROUTE);
    return { status: "success", data: result };
  } catch (error) {
    console.error(error);
    return { status: "error", error: "خطا در ویرایش غیبت" };
  }
}

export async function updateAbsenceScheduleAction(
  data: UpdateAbsenceScheduleSchema,
): Promise<ActionResult<StudentAbsence>> {
  try {
    const parsed = updateAbsenceScheduleSchema.safeParse(data);
    if (!parsed.success) {
      return {
        status: "error",
        error: parsed.error.issues[0]?.message || "داده‌های ورودی نامعتبر است",
      };
    }

    const scope = await getScope(PERMISSIONS.MANAGE_ABSENCES);
    if (isScopeError(scope)) return { status: "error", error: scope.error };

    const parsedDate = new Date(`${parsed.data.date}T00:00:00`);
    if (isNaN(parsedDate.getTime())) {
      return { status: "error", error: "تاریخ نامعتبر است" };
    }

    const absence = await prisma.studentAbsence.findFirst({
      where: {
        id: parsed.data.id,
        studentEnrollment: {
          schoolId: scope.schoolId,
          academicYearId: scope.academicYearId,
        },
      },
    });
    if (!absence) return { status: "error", error: "غیبت یافت نشد" };

    const finalStartTime = parsed.data.isFullDay
      ? null
      : parsed.data.startTime || null;
    const finalEndTime = parsed.data.isFullDay
      ? null
      : parsed.data.endTime || null;

    if (!parsed.data.isFullDay && finalStartTime && finalEndTime) {
      const duplicate = await prisma.studentAbsence.findFirst({
        where: {
          studentEnrollmentId: absence.studentEnrollmentId,
          date: parsedDate,
          isFullDay: false,
          startTime: finalStartTime,
          endTime: finalEndTime,
          id: { not: absence.id },
        },
      });

      if (duplicate) {
        return {
          status: "error",
          error:
            "برای این دانش‌آموز در همین تاریخ و بازه زمانی غیبت ثبت شده است",
        };
      }
    }

    if (parsed.data.isFullDay) {
      const duplicate = await prisma.studentAbsence.findFirst({
        where: {
          studentEnrollmentId: absence.studentEnrollmentId,
          date: parsedDate,
          isFullDay: true,
          id: { not: absence.id },
        },
      });

      if (duplicate) {
        return {
          status: "error",
          error: "برای این دانش‌آموز در همین تاریخ، غیبت روز کامل ثبت شده است",
        };
      }
    }

    const result = await prisma.studentAbsence.update({
      where: { id: absence.id },
      data: {
        date: parsedDate,
        isFullDay: parsed.data.isFullDay,
        startTime: finalStartTime,
        endTime: finalEndTime,
      },
    });

    revalidatePath(ABSENCE_ROUTE);
    return { status: "success", data: result };
  } catch (error) {
    console.error(error);
    return { status: "error", error: "خطا در ویرایش زمان غیبت" };
  }
}

export async function deleteAbsenceAction(
  data: DeleteAbsenceSchema,
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = deleteAbsenceSchema.safeParse(data);
    if (!parsed.success) {
      return {
        status: "error",
        error: parsed.error.issues[0]?.message || "داده‌های ورودی نامعتبر است",
      };
    }

    const scope = await getScope(PERMISSIONS.MANAGE_ABSENCES);
    if (isScopeError(scope)) return { status: "error", error: scope.error };

    const absence = await prisma.studentAbsence.findFirst({
      where: {
        id: parsed.data.id,
        studentEnrollment: {
          schoolId: scope.schoolId,
          academicYearId: scope.academicYearId,
        },
      },
      select: { id: true },
    });
    if (!absence) return { status: "error", error: "غیبت یافت نشد" };

    await prisma.studentAbsence.delete({ where: { id: absence.id } });

    revalidatePath(ABSENCE_ROUTE);
    return { status: "success", data: { id: absence.id } };
  } catch (error) {
    console.error(error);
    return { status: "error", error: "خطا در حذف غیبت" };
  }
}
