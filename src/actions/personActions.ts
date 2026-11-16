"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentContext } from "@/actions/authActions";

export type PersonInfo = {
  nationalCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string | null;
  fatherName?: string | null;
  personnelCode?: string | null;
  // کدام نقش‌ها این شخص را دارند
  roles: Array<"TEACHER" | "DEPUTY" | "STUDENT" | "MANAGER">;
  // داده‌های تکمیلی هر نقش
  teacher?: {
    id: string;
    personnelCode: string | null;
  };
  deputy?: {
    id: string;
    position: string | null;
    attendanceOrder: number;
    attendanceDays: string[];
    permissions: string[];
  };
};

export async function findPersonByNationalCode(params: {
  nationalCode: string;
}): Promise<
  | { status: "success"; data: PersonInfo | null }
  | { status: "error"; error: string }
> {
  try {
    const context = await getCurrentContext();
    if (!context?.user) return { status: "error", error: "وارد نشوید" };

    const nationalCode = params.nationalCode.trim();
    if (!/^\d{10}$/.test(nationalCode)) {
      return { status: "error", error: "کد ملی باید ۱۰ رقم باشد" };
    }

    // ⬇⬇ ۱. جستجو در Teacher
    const teacher = await prisma.teacher.findUnique({
      where: { nationalCode },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        nationalCode: true,
        phone: true,
        address: true,
        personnelCode: true,
      },
    });

    // ⬇⬇ ۲. جستجو در Deputy
    const deputy = await prisma.deputy.findUnique({
      where: { nationalCode },
      include: {
        permissions: { select: { permission: true } },
      },
    });

    // ⬇⬇ ۳. جستجو در Student (اختیاری — اگر دانش‌آموز هم می‌خواهید)
    const student = await prisma.student.findUnique({
      where: { nationalCode },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        nationalCode: true,
        phone: true,
        address: true,
        fatherName: true,
      },
    });

    // اگر هیچ‌کدام پیدا نشد
    if (!teacher && !deputy && !student) {
      return { status: "success", data: null };
    }

    // ⬇⬇ ۴. ترکیب اطلاعات — اولویت: Teacher > Deputy > Student
    const base = teacher ?? deputy ?? student!;

    const roles: PersonInfo["roles"] = [];
    if (teacher) roles.push("TEACHER");
    if (deputy) roles.push("DEPUTY");
    //  if (student) roles.push("STUDENT");

    return {
      status: "success",
      data: {
        nationalCode: base.nationalCode,
        firstName: base.firstName,
        lastName: base.lastName,
        phone: base.phone ?? "",
        address: base.address ?? null,
        fatherName: "fatherName" in base ? (base.fatherName ?? null) : null,
        personnelCode:
          "personnelCode" in base ? (base.personnelCode ?? null) : null,
        roles,
        teacher: teacher
          ? { id: teacher.id, personnelCode: teacher.personnelCode }
          : undefined,
        deputy: deputy
          ? {
              id: deputy.id,
              position: deputy.position,
              attendanceOrder: deputy.attendanceOrder,
              attendanceDays: deputy.attendanceDays,
              permissions: deputy.permissions.map((p) => p.permission),
            }
          : undefined,
      },
    };
  } catch (err) {
    console.error("findPersonByNationalCode error:", err);
    return { status: "error", error: "خطا در جستجو" };
  }
}
export async function checkExistingAssignment(params: {
  nationalCode: string;
  role: "TEACHER" | "DEPUTY";
  schoolId: number;
  academicYearId: number;
}): Promise<
  | { status: "success"; data: { exists: boolean } }
  | { status: "error"; error: string }
> {
  try {
    if (params.role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({
        where: { nationalCode: params.nationalCode },
        select: { id: true },
      });
      if (!teacher) {
        return { status: "success", data: { exists: false } };
      }
      const assignment = await prisma.teacherAssignment.findFirst({
        where: {
          teacherId: teacher.id,
          schoolId: params.schoolId,
          academicYearId: params.academicYearId,
        },
      });
      return { status: "success", data: { exists: !!assignment } };
    }

    if (params.role === "DEPUTY") {
      const deputy = await prisma.deputy.findUnique({
        where: { nationalCode: params.nationalCode },
        select: { id: true },
      });
      if (!deputy) {
        return { status: "success", data: { exists: false } };
      }
      const assignment = await prisma.deputyAssignment.findFirst({
        where: {
          deputyId: deputy.id,
          schoolId: params.schoolId,
          academicYearId: params.academicYearId,
          isActive: true,
        },
      });
      return { status: "success", data: { exists: !!assignment } };
    }

    return { status: "success", data: { exists: false } };
  } catch (err) {
    console.error("checkExistingAssignment error:", err);
    return { status: "error", error: "خطا در بررسی انتساب" };
  }
}
