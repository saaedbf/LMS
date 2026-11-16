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
      orderBy: [
        { deputy: { attendanceOrder: "asc" } }, // ⬅️ جدید
        { deputy: { lastName: "asc" } }, // ⬅️ جدید
      ],
    });

    return assignments.map((a) => ({
      id: a.deputy.id,
      firstName: a.deputy.firstName,
      lastName: a.deputy.lastName,
      nationalCode: a.deputy.nationalCode,
      phone: a.deputy.phone,
      address: a.deputy.address,
      position: a.deputy.position, // ⬅️ جدید
      attendanceOrder: a.deputy.attendanceOrder, // ⬅️ جدید
      attendanceDays: a.deputy.attendanceDays, // ⬅️ جدید
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
      return error("فقط مدیر می‌تواند کادر اجرایی تعریف کند");
    }

    const {
      firstName,
      lastName,
      nationalCode,
      phone,
      address,
      permissions,
      position,
      attendanceOrder,
      attendanceDays,
    } = parsed.data;

    const username = currentUser.email || currentUser.name || "unknown";

    // ⬇⬇ ۱. بررسی وجود Deputy با این کد ملی
    let deputy = await prisma.deputy.findUnique({
      where: { nationalCode },
    });

    if (deputy) {
      // چک: آیا در همین مدرسه/سال انتساب دارد؟
      const existingAssignment = await prisma.deputyAssignment.findFirst({
        where: {
          deputyId: deputy.id,
          schoolId: context.schoolId,
          academicYearId: context.academicYearId,
        },
      });

      if (existingAssignment) {
        return error("این کادر اجرایی قبلاً در این مدرسه ثبت شده است");
      }

      // Deputy موجود → فقط آپدیت
      await prisma.deputy.update({
        where: { id: deputy.id },
        data: {
          firstName,
          lastName,
          phone,
          address: address || null,
          position: position || null,
          attendanceOrder: attendanceOrder ?? 0,
          attendanceDays: attendanceDays ?? [],
          lastEditedByUsername: username,
        },
      });
    } else {
      // Deputy جدید → بساز
      deputy = await prisma.deputy.create({
        data: {
          firstName,
          lastName,
          nationalCode,
          phone,
          address: address || null,
          position: position || null,
          attendanceOrder: attendanceOrder ?? 0,
          attendanceDays: attendanceDays ?? [],
          lastEditedByUsername: username,
        },
      });
    }

    // ⬇⬇ ۲. User: بررسی/ایجاد
    let authUser: { id: string } | null = null;
    const deputyEmail = `${nationalCode}@lms.local`.toLowerCase();

    // ۲.۱ چک Teacher (اولویت اول — چون ممکن است معلم باشد)
    const existingTeacher = await prisma.teacher.findFirst({
      where: { nationalCode },
      select: { id: true, userId: true },
    });

    if (existingTeacher) {
      if (existingTeacher.userId) {
        authUser = { id: existingTeacher.userId };
      } else {
        // Teacher هست ولی User ندارد → User بساز و به Teacher وصل کن
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
        } catch (e) {
          console.error("signUpEmail (teacher no user) error:", e);
        }

        const newUser = await prisma.user.findUnique({
          where: { email: deputyEmail },
          select: { id: true },
        });

        if (newUser) {
          authUser = { id: newUser.id };
          await prisma.teacher.update({
            where: { id: existingTeacher.id },
            data: { userId: newUser.id },
          });
        }
      }
    }

    // ۲.۲ چک email (اگر Teacher نبود یا User نداشت)
    if (!authUser) {
      authUser = await prisma.user.findUnique({
        where: { email: deputyEmail },
        select: { id: true },
      });
    }

    // ۲.۳ چک Deputy
    if (!authUser) {
      const existingDeputy = await prisma.deputy.findFirst({
        where: { nationalCode, userId: { not: null } },
        select: { userId: true },
      });
      if (existingDeputy?.userId) {
        authUser = { id: existingDeputy.userId };
      }
    }

    // ۲.۴ اگر هیچ‌کدام نبود، User جدید بساز
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
      } catch (e) {
        console.error("signUpEmail error:", e);
      }

      authUser = await prisma.user.findUnique({
        where: { email: deputyEmail },
        select: { id: true },
      });
    }

    if (!authUser) {
      return error("خطا در ایجاد یا یافتن حساب کاربری");
    }

    const userId = authUser.id;

    // ⬇⬇ ۳. اتصال Deputy به User (اگر متفاوت بود)
    if (deputy.userId !== userId) {
      await prisma.deputy.update({
        where: { id: deputy.id },
        data: { userId },
      });
    }

    // ⬇⬇ ۴. UserAssignment (اگر وجود ندارد)
    const existingUA = await prisma.userAssignment.findFirst({
      where: {
        userId,
        schoolId: context.schoolId,
        academicYearId: context.academicYearId,
        role: "DEPUTY",
      },
    });

    if (!existingUA) {
      await prisma.userAssignment.create({
        data: {
          userId,
          schoolId: context.schoolId,
          academicYearId: context.academicYearId,
          role: "DEPUTY",
          isActive: true,
        },
      });
    }

    // ⬇⬇ ۵. DeputyAssignment (اگر وجود ندارد)
    const existingDA = await prisma.deputyAssignment.findFirst({
      where: {
        deputyId: deputy.id,
        schoolId: context.schoolId,
        academicYearId: context.academicYearId,
      },
    });

    if (!existingDA) {
      await prisma.deputyAssignment.create({
        data: {
          deputyId: deputy.id,
          schoolId: context.schoolId,
          academicYearId: context.academicYearId,
          isActive: true,
          lastEditedByUsername: username,
        },
      });
    }

    // ⬇⬇ ۶. ذخیره دسترسی‌ها
    await prisma.deputyPermission.deleteMany({
      where: { deputyId: deputy.id },
    });
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
    console.error("CREATE_DEPUTY_ERROR", err);
    return error("خطا در ایجاد کادر اجرایی");
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
      position,
      attendanceOrder,
      attendanceDays,
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
          position: position || null,
          attendanceOrder: attendanceOrder ?? 0,
          attendanceDays: attendanceDays ?? [],
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
export async function findDeputyByNationalCode({
  nationalCode,
}: {
  nationalCode: string;
}): Promise<
  | {
      status: "success";
      data: {
        id: string;
        firstName: string;
        lastName: string;
        nationalCode: string;
        phone: string;
        address: string | null;
        position: string | null;
        attendanceOrder: number;
        attendanceDays: string[];
        permissions: string[];
        hasAssignmentInCurrentYear: boolean;
      } | null;
    }
  | { status: "error"; error: string }
> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return error("ابتدا وارد شوید");

    const context = await getCurrentContext();
    if (!context?.schoolId || !context.academicYearId) {
      return error("کانتکست فعال یافت نشد");
    }

    const deputy = await prisma.deputy.findUnique({
      where: { nationalCode },
      include: {
        permissions: { select: { permission: true } },
        assignments: {
          where: {
            schoolId: context.schoolId,
            academicYearId: context.academicYearId,
            isActive: true,
          },
          select: { id: true },
        },
      },
    });

    if (!deputy) {
      return success(null);
    }

    return success({
      id: deputy.id,
      firstName: deputy.firstName,
      lastName: deputy.lastName,
      nationalCode: deputy.nationalCode,
      phone: deputy.phone,
      address: deputy.address,
      position: deputy.position,
      attendanceOrder: deputy.attendanceOrder,
      attendanceDays: deputy.attendanceDays,
      permissions: deputy.permissions.map((p) => p.permission),
      hasAssignmentInCurrentYear: deputy.assignments.length > 0,
    });
  } catch (err) {
    console.error("findDeputyByNationalCode error:", err);
    return error("خطا در جستجوی کادر اجرایی");
  }
}
