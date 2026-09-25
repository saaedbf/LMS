"use server";

import { prisma } from "@/lib/prisma";
import { getScope } from "@/lib/auth-helpers";
import { isScopeError } from "@/lib/auth-helpers-utils";
import { PERMISSIONS } from "@/lib/permissions";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  createStudentSchema,
  findStudentByNationalCodeSchema,
  updateStudentSchema,
} from "@/lib/schemas/student";

type ActionSuccess<T> = { status: "success"; data: T };
type ActionError = { status: "error"; error: string };

type StudentWithEnrollments = {
  id: string;
  firstName: string;
  lastName: string;
  nationalCode: string;
  phone: string | null;
  address: string | null;
  fatherName: string | null;
  lastEditedByUsername: string | null;
  enrollments: Array<{
    id: string;
    studentId: string;
    schoolId: number;
    academicYearId: number;
    payeId: number;
    reshtehTahsiliId: number;
    klassId: string;
    school: { id: number; title?: string | null; name?: string | null } | null;
    academicYear: {
      id: number;
      title?: string | null;
      name?: string | null;
      year?: string | null;
    } | null;
    paye: { id: number; title?: string | null; name?: string | null } | null;
    reshtehTahsili: {
      id: number;
      title?: string | null;
      name?: string | null;
    } | null;
    klass: {
      id: string;
      title?: string | null;
      name?: string | null;
      className?: string | null;
      klassName?: string | null;
    } | null;
  }>;
};

function success<T>(data: T): ActionSuccess<T> {
  return { status: "success", data };
}

function error(message: string): ActionError {
  return { status: "error", error: message };
}

function mapStudent(student: any): StudentWithEnrollments {
  return {
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    nationalCode: student.nationalCode,
    phone: student.phone ?? null,
    address: student.address ?? null,
    fatherName: student.fatherName ?? null,
    lastEditedByUsername: student.lastEditedByUsername ?? null,
    enrollments: (student.enrollments ?? []).map((enrollment: any) => ({
      id: enrollment.id,
      studentId: enrollment.studentId,
      schoolId: enrollment.schoolId,
      academicYearId: enrollment.academicYearId,
      payeId: enrollment.payeId,
      reshtehTahsiliId: enrollment.reshtehTahsiliId,
      klassId: enrollment.klassId,
      school: enrollment.school
        ? {
            id: enrollment.school.id,
            title: enrollment.school.title ?? null,
            name: enrollment.school.name ?? null,
          }
        : null,
      academicYear: enrollment.academicYear
        ? {
            id: enrollment.academicYear.id,
            title: enrollment.academicYear.title ?? null,
            name: enrollment.academicYear.name ?? null,
            year: enrollment.academicYear.year ?? null,
          }
        : null,
      paye: enrollment.paye
        ? {
            id: enrollment.paye.id,
            title: enrollment.paye.title ?? null,
            name: enrollment.paye.name ?? null,
          }
        : null,
      reshtehTahsili: enrollment.reshtehTahsili
        ? {
            id: enrollment.reshtehTahsili.id,
            title: enrollment.reshtehTahsili.title ?? null,
            name: enrollment.reshtehTahsili.name ?? null,
          }
        : null,
      klass: enrollment.klass
        ? {
            id: enrollment.klass.id,
            title: enrollment.klass.title ?? null,
            name: enrollment.klass.name ?? null,
            className: enrollment.klass.className ?? null,
            klassName: enrollment.klass.klassName ?? null,
          }
        : null,
    })),
  };
}

export async function findStudentByNationalCode(
  input: unknown,
): Promise<ActionSuccess<StudentWithEnrollments | null> | ActionError> {
  const parsed = findStudentByNationalCodeSchema.safeParse(input);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "کد ملی نامعتبر است.");
  }

  const scope = await getScope(PERMISSIONS.MANAGE_STUDENTS);
  if (isScopeError(scope)) return error(scope.error);

  try {
    const student = await prisma.student.findUnique({
      where: { nationalCode: parsed.data.nationalCode },
      include: {
        enrollments: {
          include: {
            school: true,
            academicYear: true,
            paye: true,
            reshtehTahsili: true,
            klass: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!student) return success(null);
    return success(mapStudent(student));
  } catch (err) {
    return error("خطا در دریافت اطلاعات دانش‌آموز.");
  }
}

export async function resetStudentPassword(
  studentId: string,
): Promise<ActionSuccess<{ message: string }> | ActionError> {
  const scope = await getScope(PERMISSIONS.MANAGE_STUDENTS);
  if (isScopeError(scope)) return error(scope.error);

  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, nationalCode: true, phone: true },
    });

    if (!student) return error("دانش‌آموز موردنظر پیدا نشد.");

    const phone = student.phone?.trim();
    if (!phone) {
      return error(
        "برای این دانش‌آموز شماره تماسی ثبت نشده است؛ ابتدا شماره تماس را ثبت کنید.",
      );
    }

    const studentEmail = `${student.nationalCode}@lms.local`.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: studentEmail },
      select: { id: true },
    });

    if (!user) {
      return error("برای این دانش‌آموز حساب کاربری ایجاد نشده است.");
    }

    await auth.api.setUserPassword({
      headers: await headers(),
      body: { userId: user.id, newPassword: phone },
    });

    revalidatePath("/dashboard/manager/students");

    return success({
      message: "کلمه عبور دانش‌آموز با موفقیت به شماره تماس تغییر کرد.",
    });
  } catch (err) {
    console.error("RESET_STUDENT_PASSWORD_ERROR", err);
    return error("خطا در ریست کلمه عبور دانش‌آموز.");
  }
}

export async function createStudent(
  input: unknown,
): Promise<ActionSuccess<StudentWithEnrollments> | ActionError> {
  const parsed = createStudentSchema.safeParse(input);
  if (!parsed.success) {
    return error(
      parsed.error.issues[0]?.message ?? "اطلاعات دانش‌آموز نامعتبر است.",
    );
  }

  const scope = await getScope(PERMISSIONS.MANAGE_STUDENTS);
  if (isScopeError(scope)) return error(scope.error);

  const { schoolId, academicYearId, username: currentUsername } = scope;
  const { firstName, lastName, nationalCode, phone, address, fatherName } =
    parsed.data;

  if (!phone?.trim()) {
    return error("برای ایجاد حساب کاربری دانش‌آموز، شماره تماس الزامی است.");
  }

  const studentEmail = `${nationalCode}@lms.local`.toLowerCase();
  let createdStudentId: string | null = null;
  let createdUserId: string | null = null;

  try {
    const existingStudent = await prisma.student.findUnique({
      where: { nationalCode },
      select: { id: true },
    });

    if (existingStudent) {
      return error("دانش‌آموزی با این کد ملی قبلاً ثبت شده است.");
    }

    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        nationalCode,
        phone: phone.trim(),
        address: address || null,
        fatherName: fatherName || null,
        lastEditedByUsername: currentUsername,
      },
    });

    createdStudentId = student.id;

    let authUser = await prisma.user.findUnique({
      where: { email: studentEmail },
      select: { id: true },
    });

    if (!authUser) {
      try {
        await auth.api.signUpEmail({
          headers: await headers(),
          body: {
            email: studentEmail,
            password: phone.trim(),
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
          },
        });

        authUser = await prisma.user.findUnique({
          where: { email: studentEmail },
          select: { id: true },
        });
      } catch (authError) {
        authUser = await prisma.user.findUnique({
          where: { email: studentEmail },
          select: { id: true },
        });
        if (!authUser) throw authError;
      }
    }

    if (!authUser) throw new Error("AUTH_USER_NOT_FOUND");

    createdUserId = authUser.id;

    const existingUserAssignment = await prisma.userAssignment.findFirst({
      where: {
        userId: authUser.id,
        schoolId,
        academicYearId,
        role: "STUDENT",
      },
    });

    if (!existingUserAssignment) {
      await prisma.userAssignment.create({
        data: {
          userId: authUser.id,
          schoolId,
          academicYearId,
          role: "STUDENT",
          isActive: true,
        },
      });
    }

    revalidatePath("/dashboard/manager/students");

    const finalStudent = await prisma.student.findUnique({
      where: { id: student.id },
      include: {
        enrollments: {
          where: { schoolId, academicYearId },
          include: {
            school: true,
            academicYear: true,
            paye: true,
            reshtehTahsili: true,
            klass: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return success(mapStudent(finalStudent));
  } catch (err: any) {
    if (createdStudentId) {
      await prisma.student
        .delete({ where: { id: createdStudentId } })
        .catch(() => {});
    }

    if (createdUserId) {
      await prisma.userAssignment
        .deleteMany({ where: { userId: createdUserId } })
        .catch(() => {});
    }

    if (err?.code === "P2002") {
      return error("دانش‌آموزی با این کد ملی قبلاً ثبت شده است.");
    }

    console.error("CREATE_STUDENT_ERROR", err);
    return error("خطا در ایجاد دانش‌آموز یا حساب کاربری.");
  }
}

export async function updateStudent(
  input: unknown,
): Promise<ActionSuccess<StudentWithEnrollments> | ActionError> {
  const parsed = updateStudentSchema.safeParse(input);
  if (!parsed.success) {
    return error(
      parsed.error.issues[0]?.message ?? "اطلاعات ویرایش نامعتبر است.",
    );
  }

  const scope = await getScope(PERMISSIONS.MANAGE_STUDENTS);
  if (isScopeError(scope)) return error(scope.error);

  const currentUsername = scope.username;

  try {
    const student = await prisma.student.findUnique({
      where: { id: parsed.data.studentId },
    });

    if (!student) {
      return error("دانش‌آموز موردنظر پیدا نشد.");
    }

    const duplicateNationalCode = await prisma.student.findFirst({
      where: {
        nationalCode: parsed.data.nationalCode,
        NOT: { id: parsed.data.studentId },
      },
      select: { id: true },
    });

    if (duplicateNationalCode) {
      return error("دانش‌آموز دیگری با این کد ملی وجود دارد.");
    }

    const updatedStudent = await prisma.student.update({
      where: { id: parsed.data.studentId },
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        nationalCode: parsed.data.nationalCode,
        phone: parsed.data.phone,
        address: parsed.data.address || null,
        fatherName: parsed.data.fatherName || null,
        lastEditedByUsername: currentUsername,
      },
      include: {
        enrollments: {
          include: {
            school: true,
            academicYear: true,
            paye: true,
            reshtehTahsili: true,
            klass: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return success(mapStudent(updatedStudent));
  } catch (err: any) {
    if (err?.code === "P2002") {
      return error("دانش‌آموز دیگری با این کد ملی وجود دارد.");
    }
    return error("خطا در ویرایش دانش‌آموز.");
  }
}

export async function getStudentById(
  studentId: string,
): Promise<ActionSuccess<StudentWithEnrollments> | ActionError> {
  if (!studentId) return error("شناسه دانش‌آموز نامعتبر است.");

  const scope = await getScope(PERMISSIONS.MANAGE_STUDENTS);
  if (isScopeError(scope)) return error(scope.error);

  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          include: {
            school: true,
            academicYear: true,
            paye: true,
            reshtehTahsili: true,
            klass: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!student) return error("دانش‌آموز پیدا نشد.");
    return success(mapStudent(student));
  } catch (err) {
    return error("خطا در دریافت دانش‌آموز.");
  }
}

export async function getStudents(
  page: number,
  pageSize: number,
  options?: {
    sortField?: string;
    sortOrder?: "asc" | "desc";
    searchField?: string;
    searchValue?: string;
  },
) {
  const scope = await getScope(PERMISSIONS.MANAGE_STUDENTS);
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
    "phone",
    "fatherName",
    "createdAt",
    "updatedAt",
  ];

  const orderByField = allowedSortFields.includes(sortField)
    ? sortField
    : "createdAt";

  const where: any = {
    enrollments: {
      some: { schoolId, academicYearId },
    },
  };

  if (searchField && searchValue?.trim()) {
    const value = searchValue.trim();
    const allowedSearchFields = [
      "firstName",
      "lastName",
      "nationalCode",
      "phone",
      "fatherName",
    ];

    if (allowedSearchFields.includes(searchField)) {
      where[searchField] = { contains: value, mode: "insensitive" };
    }
  }

  try {
    const [items, total] = await prisma.$transaction([
      prisma.student.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [orderByField]: sortOrder },
        include: {
          enrollments: {
            where: { schoolId, academicYearId },
            include: {
              school: { select: { id: true, title: true } },
              academicYear: { select: { id: true, title: true } },
              paye: { select: { id: true, title: true } },
              reshtehTahsili: { select: { id: true, title: true } },
              klass: { select: { id: true, title: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      }),
      prisma.student.count({ where }),
    ]);

    return { items, total };
  } catch (error) {
    console.error("getStudents error:", error);
    return { items: [], total: 0 };
  }
}
