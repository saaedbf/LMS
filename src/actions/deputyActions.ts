"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth-server";
import { getCurrentContext } from "@/actions/authActions";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createDeputySchema, updateDeputySchema } from "@/lib/schemas/deputy";

const DEPUTY_ROUTE = "/dashboard/manager/deputies";

type ActionSuccess<T> = { status: "success"; data: T };
type ActionError = { status: "error"; error: string };

function success<T>(data: T): ActionSuccess<T> {
  return { status: "success", data };
}

function error(message: string): ActionError {
  return { status: "error", error: message };
}

// ==========================================
// دریافت لیست معاونین مدرسه
// ==========================================
export async function getDeputies() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return [];

  const context = await getCurrentContext();
  if (!context?.schoolId || !context.academicYearId) return [];

  try {
    const assignments = await prisma.deputyAssignment.findMany({
      where: {
        schoolId: context.schoolId,
        academicYearId: context.academicYearId,
        isActive: true,
      },
      include: {
        deputy: {
          include: {
            permissions: true,
          },
        },
      },
      orderBy: {
        deputy: { firstName: "asc" },
      },
    });

    return assignments.map((a) => ({
      id: a.deputy.id,
      firstName: a.deputy.firstName,
      lastName: a.deputy.lastName,
      nationalCode: a.deputy.nationalCode,
      phone: a.deputy.phone,
      address: a.deputy.address,
      permissions: a.deputy.permissions.map((p) => p.permission),
      assignmentId: a.id,
    }));
  } catch (err) {
    console.error("getDeputies error:", err);
    return [];
  }
}

// ==========================================
// ایجاد معاون جدید
// ==========================================
export async function createDeputy(input: unknown) {
  try {
    const parsed = createDeputySchema.safeParse(input);
    if (!parsed.success) {
      return error(parsed.error.issues[0]?.message || "داده نامعتبر");
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) return error("ابتدا وارد شوید");

    const context = await getCurrentContext();
    if (!context?.schoolId || !context.academicYearId) {
      return error("کانتکست فعال یافت نشد");
    }

    if (context.role !== "MANAGER") {
      return error("فقط مدیر می‌تواند معاون تعریف کند");
    }

    const { firstName, lastName, nationalCode, phone, address, permissions } =
      parsed.data;

    const username = currentUser.email || currentUser.name || "unknown";
    const deputyEmail = `${nationalCode}@lms.local`.toLowerCase();

    let createdDeputyId: string | null = null;
    let createdUserId: string | null = null;

    try {
      // ۱. بررسی وجود معاون با این کد ملی
      const existingDeputy = await prisma.deputy.findUnique({
        where: { nationalCode },
      });

      if (existingDeputy) {
        return error("معاونی با این کد ملی قبلاً ثبت شده است");
      }

      // ۲. ایجاد پروفایل معاون
      const deputy = await prisma.deputy.create({
        data: {
          firstName,
          lastName,
          nationalCode,
          phone,
          address: address || null,
          lastEditedByUsername: username,
        },
      });

      createdDeputyId = deputy.id;

      // ۳. بررسی/ایجاد User
      let authUser = await prisma.user.findUnique({
        where: { email: deputyEmail },
        select: { id: true },
      });

      if (!authUser) {
        try {
          await auth.api.signUpEmail({
            headers: await headers(),
            body: {
              email: deputyEmail,
              password: phone.trim(),
              firstName,
              lastName,
              name: `${firstName} ${lastName}`,
            },
          });

          authUser = await prisma.user.findUnique({
            where: { email: deputyEmail },
            select: { id: true },
          });
        } catch (authError) {
          authUser = await prisma.user.findUnique({
            where: { email: deputyEmail },
            select: { id: true },
          });

          if (!authUser) throw authError;
        }
      }

      if (!authUser) throw new Error("AUTH_USER_NOT_FOUND");

      createdUserId = authUser.id;

      // ۴. اتصال Deputy به User
      await prisma.deputy.update({
        where: { id: deputy.id },
        data: { userId: authUser.id },
      });

      // ۵. ساخت UserAssignment با نقش DEPUTY
      await prisma.userAssignment.create({
        data: {
          userId: authUser.id,
          schoolId: context.schoolId,
          academicYearId: context.academicYearId,
          role: "DEPUTY",
          isActive: true,
        },
      });

      // ۶. ساخت DeputyAssignment
      await prisma.deputyAssignment.create({
        data: {
          deputyId: deputy.id,
          schoolId: context.schoolId,
          academicYearId: context.academicYearId,
          isActive: true,
          lastEditedByUsername: username,
        },
      });

      // ۷. ذخیره دسترسی‌ها
      if (permissions.length > 0) {
        await prisma.deputyPermission.createMany({
          data: permissions.map((p) => ({
            deputyId: deputy.id,
            permission: p,
          })),
          skipDuplicates: true,
        });
      }

      revalidatePath(DEPUTY_ROUTE);
      return success({ id: deputy.id });
    } catch (err: any) {
      // Rollback
      if (createdDeputyId) {
        await prisma.deputy
          .delete({ where: { id: createdDeputyId } })
          .catch(() => {});
      }

      if (createdUserId) {
        await prisma.userAssignment
          .deleteMany({ where: { userId: createdUserId } })
          .catch(() => {});
      }

      throw err;
    }
  } catch (err: any) {
    console.error("CREATE_DEPUTY_ERROR", err);
    return error("خطا در ایجاد معاون");
  }
}

// ==========================================
// ویرایش معاون
// ==========================================
export async function updateDeputy(input: unknown) {
  try {
    const parsed = updateDeputySchema.safeParse(input);
    if (!parsed.success) {
      return error(parsed.error.issues[0]?.message || "داده نامعتبر");
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) return error("ابتدا وارد شوید");

    const context = await getCurrentContext();
    if (!context?.schoolId || !context.academicYearId) {
      return error("کانتکست فعال یافت نشد");
    }

    const {
      id,
      firstName,
      lastName,
      nationalCode,
      phone,
      address,
      permissions,
    } = parsed.data;

    const username = currentUser.email || currentUser.name || "unknown";

    // بررسی وجود معاون در این مدرسه
    const assignment = await prisma.deputyAssignment.findFirst({
      where: {
        deputyId: id,
        schoolId: context.schoolId,
        academicYearId: context.academicYearId,
      },
    });

    if (!assignment) {
      return error("معاون یافت نشد");
    }

    // به‌روزرسانی
    await prisma.$transaction(async (tx) => {
      // ۱. به‌روزرسانی پروفایل
      await tx.deputy.update({
        where: { id },
        data: {
          firstName,
          lastName,
          phone,
          address: address || null,
          lastEditedByUsername: username,
        },
      });

      // ۲. حذف دسترسی‌های قبلی
      await tx.deputyPermission.deleteMany({
        where: { deputyId: id },
      });

      // ۳. ذخیره دسترسی‌های جدید
      if (permissions.length > 0) {
        await tx.deputyPermission.createMany({
          data: permissions.map((p) => ({
            deputyId: id,
            permission: p,
          })),
          skipDuplicates: true,
        });
      }
    });

    revalidatePath(DEPUTY_ROUTE);
    return success({ id });
  } catch (err) {
    console.error("UPDATE_DEPUTY_ERROR", err);
    return error("خطا در ویرایش معاون");
  }
}

// ==========================================
// حذف معاون
// ==========================================
export async function deleteDeputy(deputyId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return error("ابتدا وارد شوید");

    const context = await getCurrentContext();
    if (!context?.schoolId || !context.academicYearId) {
      return error("کانتکست فعال یافت نشد");
    }

    // بررسی وجود معاون در این مدرسه
    const assignment = await prisma.deputyAssignment.findFirst({
      where: {
        deputyId,
        schoolId: context.schoolId,
        academicYearId: context.academicYearId,
      },
    });

    if (!assignment) {
      return error("معاون یافت نشد");
    }

    // حذف انتساب (معاون باقی می‌ماند)
    await prisma.deputyAssignment.delete({
      where: { id: assignment.id },
    });

    // حذف UserAssignment
    const deputy = await prisma.deputy.findUnique({
      where: { id: deputyId },
      select: { userId: true },
    });

    if (deputy?.userId) {
      await prisma.userAssignment.deleteMany({
        where: {
          userId: deputy.userId,
          schoolId: context.schoolId,
          academicYearId: context.academicYearId,
          role: "DEPUTY",
        },
      });
    }

    revalidatePath(DEPUTY_ROUTE);
    return success({ id: deputyId });
  } catch (err) {
    console.error("DELETE_DEPUTY_ERROR", err);
    return error("خطا در حذف معاون");
  }
}

// ==========================================
// دریافت دسترسی‌های معاون (برای UI)
// ==========================================
export async function getDeputyPermissions(deputyId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return [];

    const permissions = await prisma.deputyPermission.findMany({
      where: { deputyId },
      select: { permission: true },
    });

    return permissions.map((p) => p.permission);
  } catch (err) {
    console.error("getDeputyPermissions error:", err);
    return [];
  }
}
