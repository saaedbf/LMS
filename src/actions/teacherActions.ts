"use server";

import { prisma } from "@/lib/prisma";
import { getScope } from "@/lib/auth-helpers";
import { isScopeError } from "@/lib/auth-helpers-utils";
import { PERMISSIONS } from "@/lib/permissions";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  findTeacherByNationalCodeSchema,
  teacherSchema,
  TeacherSchema,
} from "@/lib/schemas/teacher";

type ActionSuccess<T> = { status: "success"; data: T };
type ActionError = { status: "error"; error: string };

type TeacherWithAssignments = {
  id: string;
  firstName: string;
  lastName: string;
  nationalCode: string;
  personnelCode: string | null;
  phone: string | null;
  address: string | null;
  lastEditedByUsername: string | null;
  assignments: Array<{
    id: string;
    teacherId: string;
    schoolId: number;
    academicYearId: number;
    isActive: boolean;
    school: { id: number; title?: string | null; name?: string | null } | null;
    academicYear: {
      id: number;
      title?: string | null;
      name?: string | null;
    } | null;
  }>;
};

function success<T>(data: T): ActionSuccess<T> {
  return { status: "success", data };
}

function error(message: string): ActionError {
  return { status: "error", error: message };
}

function mapTeacher(teacher: any): TeacherWithAssignments {
  return {
    id: teacher.id,
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    nationalCode: teacher.nationalCode,
    personnelCode: teacher.personnelCode ?? null,
    phone: teacher.phone ?? null,
    address: teacher.address ?? null,
    lastEditedByUsername: teacher.lastEditedByUsername ?? null,
    assignments: (teacher.assignments ?? []).map((assignment: any) => ({
      id: assignment.id,
      teacherId: assignment.teacherId,
      schoolId: assignment.schoolId,
      academicYearId: assignment.academicYearId,
      isActive: assignment.isActive,
      school: assignment.school
        ? {
            id: assignment.school.id,
            title: assignment.school.title ?? null,
            name: assignment.school.name ?? null,
          }
        : null,
      academicYear: assignment.academicYear
        ? {
            id: assignment.academicYear.id,
            title: assignment.academicYear.title ?? null,
            name: assignment.academicYear.name ?? null,
          }
        : null,
    })),
  };
}

export async function findTeacherByNationalCode(
  input: unknown,
): Promise<ActionSuccess<TeacherWithAssignments | null> | ActionError> {
  const parsed = findTeacherByNationalCodeSchema.safeParse(input);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "کد ملی نامعتبر است.");
  }

  const scope = await getScope(PERMISSIONS.MANAGE_TEACHERS);
  if (isScopeError(scope)) return error(scope.error);

  try {
    const teacher = await prisma.teacher.findUnique({
      where: { nationalCode: parsed.data.nationalCode },
      include: {
        assignments: {
          include: { school: true, academicYear: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!teacher) return success(null);
    return success(mapTeacher(teacher));
  } catch (err) {
    return error("خطا در دریافت اطلاعات معلم.");
  }
}

export async function resetTeacherPassword(
  teacherId: string,
): Promise<ActionSuccess<{ message: string }> | ActionError> {
  const scope = await getScope(PERMISSIONS.MANAGE_TEACHERS);
  if (isScopeError(scope)) return error(scope.error);

  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { id: true, nationalCode: true, phone: true },
    });

    if (!teacher) return error("معلم موردنظر پیدا نشد.");

    const phone = teacher.phone?.trim();
    if (!phone) return error("برای این معلم شماره تماسی ثبت نشده است.");

    const teacherEmail = `${teacher.nationalCode}@lms.local`.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: teacherEmail },
      select: { id: true },
    });

    if (!user) {
      return error("برای این معلم حساب کاربری ایجاد نشده است.");
    }

    await auth.api.setUserPassword({
      headers: await headers(),
      body: { userId: user.id, newPassword: phone },
    });

    revalidatePath("/dashboard/manager/teachers");
    return success({
      message: "کلمه عبور معلم با موفقیت به شماره تماس تغییر کرد.",
    });
  } catch (err) {
    console.error("RESET_TEACHER_PASSWORD_ERROR", err);
    return error("خطا در ریست کلمه عبور معلم.");
  }
}

export async function createTeacher(
  input: TeacherSchema,
): Promise<ActionSuccess<TeacherWithAssignments> | ActionError> {
  const parsed = teacherSchema.safeParse(input);
  if (!parsed.success) {
    return error(
      parsed.error.issues[0]?.message ?? "اطلاعات معلم نامعتبر است.",
    );
  }

  const scope = await getScope(PERMISSIONS.MANAGE_TEACHERS);
  if (isScopeError(scope)) return error(scope.error);

  const { schoolId, academicYearId, username: currentUsername } = scope;
  const { firstName, lastName, nationalCode, phone, address, personnelCode } =
    parsed.data;

  const teacherEmail = `${nationalCode}@lms.local`.toLowerCase();
  let createdTeacherId: string | null = null;
  let createdUserId: string | null = null;

  try {
    const existingTeacher = await prisma.teacher.findUnique({
      where: { nationalCode },
      select: { id: true },
    });

    if (existingTeacher) {
      return error("معلمی با این کد ملی قبلاً ثبت شده است.");
    }

    const teacher = await prisma.teacher.create({
      data: {
        firstName,
        lastName,
        nationalCode,
        phone,
        personnelCode: personnelCode || null,
        address: address || null,
        lastEditedByUsername: currentUsername,
      },
    });

    createdTeacherId = teacher.id;

    let authUser = await prisma.user.findUnique({
      where: { email: teacherEmail },
      select: { id: true },
    });

    if (!authUser) {
      try {
        await auth.api.signUpEmail({
          headers: await headers(),
          body: {
            email: teacherEmail,
            password: phone.trim(),
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
          },
        });

        authUser = await prisma.user.findUnique({
          where: { email: teacherEmail },
          select: { id: true },
        });
      } catch (authError) {
        authUser = await prisma.user.findUnique({
          where: { email: teacherEmail },
          select: { id: true },
        });
        if (!authUser) throw authError;
      }
    }

    if (!authUser) throw new Error("AUTH_USER_NOT_FOUND");

    createdUserId = authUser.id;

    await prisma.teacher.update({
      where: { id: teacher.id },
      data: { userId: authUser.id },
    });

    await prisma.userAssignment.create({
      data: {
        userId: authUser.id,
        schoolId,
        academicYearId,
        role: "TEACHER",
        isActive: true,
      },
    });

    await prisma.teacherAssignment.create({
      data: {
        teacherId: teacher.id,
        schoolId,
        academicYearId,
        isActive: true,
        lastEditedByUsername: currentUsername,
      },
    });

    revalidatePath("/dashboard/manager/teachers");

    const finalTeacher = await prisma.teacher.findUnique({
      where: { id: teacher.id },
      include: {
        assignments: {
          include: { school: true, academicYear: true },
        },
      },
    });

    return success(mapTeacher(finalTeacher));
  } catch (err: any) {
    if (createdTeacherId) {
      await prisma.teacherAssignment
        .deleteMany({ where: { teacherId: createdTeacherId } })
        .catch(() => {});
      await prisma.teacher
        .delete({ where: { id: createdTeacherId } })
        .catch(() => {});
    }

    if (createdUserId) {
      await prisma.userAssignment
        .deleteMany({ where: { userId: createdUserId } })
        .catch(() => {});
    }

    if (err?.code === "P2002") {
      return error("معلمی با این کد ملی قبلاً ثبت شده است.");
    }

    console.error("CREATE_TEACHER_ERROR", err);
    return error("خطا در ایجاد معلم یا حساب کاربری.");
  }
}

export async function updateTeacher(
  input: TeacherSchema,
): Promise<ActionSuccess<TeacherWithAssignments> | ActionError> {
  const parsed = teacherSchema.safeParse(input);
  if (!parsed.success) {
    return error(
      parsed.error.issues[0]?.message ?? "اطلاعات ویرایش نامعتبر است.",
    );
  }

  if (!parsed.data.id) {
    return error("شناسه معلم برای ویرایش الزامی است.");
  }

  const scope = await getScope(PERMISSIONS.MANAGE_TEACHERS);
  if (isScopeError(scope)) return error(scope.error);

  const currentUsername = scope.username;

  try {
    const duplicate = await prisma.teacher.findFirst({
      where: {
        nationalCode: parsed.data.nationalCode,
        NOT: { id: parsed.data.id },
      },
      select: { id: true },
    });

    if (duplicate) {
      return error("معلم دیگری با این کد ملی وجود دارد.");
    }

    const updatedTeacher = await prisma.teacher.update({
      where: { id: parsed.data.id },
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        nationalCode: parsed.data.nationalCode,
        phone: parsed.data.phone,
        personnelCode: parsed.data.personnelCode || null,
        address: parsed.data.address || null,
        lastEditedByUsername: currentUsername,
      },
      include: {
        assignments: {
          include: { school: true, academicYear: true },
        },
      },
    });

    revalidatePath("/dashboard/manager/teachers");
    return success(mapTeacher(updatedTeacher));
  } catch (err: any) {
    if (err?.code === "P2002") {
      return error("معلم دیگری با این کد ملی وجود دارد.");
    }
    return error("خطا در ویرایش اطلاعات معلم.");
  }
}

export async function getTeachers(
  page: number,
  pageSize: number,
  options?: {
    sortField?: string;
    sortOrder?: "asc" | "desc";
    searchField?: string;
    searchValue?: string;
  },
) {
  const scope = await getScope(PERMISSIONS.MANAGE_TEACHERS);
  if (isScopeError(scope)) return { items: [], total: 0 };

  const { schoolId, academicYearId } = scope;

  const {
    sortField = "createdAt",
    sortOrder = "desc",
    searchField,
    searchValue,
  } = options ?? {};

  const skip = (page - 1) * pageSize;

  const allowedSortFields = [
    "firstName",
    "lastName",
    "nationalCode",
    "personnelCode",
    "phone",
    "createdAt",
    "updatedAt",
  ];

  const orderByField = allowedSortFields.includes(sortField)
    ? sortField
    : "createdAt";

  const where: any = {
    assignments: {
      some: { schoolId, academicYearId, isActive: true },
    },
  };

  if (searchField && searchValue?.trim()) {
    const value = searchValue.trim();
    const allowedSearchFields = [
      "firstName",
      "lastName",
      "nationalCode",
      "personnelCode",
      "phone",
    ];

    if (allowedSearchFields.includes(searchField)) {
      where[searchField] = { contains: value, mode: "insensitive" };
    }
  }

  try {
    const [items, total] = await prisma.$transaction([
      prisma.teacher.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [orderByField]: sortOrder },
        include: {
          assignments: {
            where: { schoolId, academicYearId },
            include: {
              school: { select: { id: true, title: true } },
              academicYear: { select: { id: true, title: true } },
            },
          },
        },
      }),
      prisma.teacher.count({ where }),
    ]);

    return { items, total };
  } catch (error) {
    console.error("getTeachers error:", error);
    return { items: [], total: 0 };
  }
}
