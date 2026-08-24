"use server";

import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SchoolRole } from "@prisma/client";

/**
 * سشن + user را از Better Auth می‌گیریم
 */
async function requireSession() {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionData?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return sessionData;
}

/**
 * انتخاب کانتکست فعال برای سشن جاری
 */
export async function setActiveContext(assignmentId: number) {
  const sessionData = await requireSession();

  // 1) مطمئن شو assignment متعلق به همین user است و فعال است
  const assignment = await prisma.userAssignment.findFirst({
    where: {
      id: assignmentId,
      userId: sessionData.user.id,
      isActive: true,
      school: { isActive: true },
      academicYear: { isActive: true },
    },
    select: { id: true },
  });

  if (!assignment) {
    throw new Error("FORBIDDEN");
  }

  // 2) سشن جاری را آپدیت کن
  // نکته: بسته به شکل sessionData ممکن است session.id یا session.token داشته باشی.
  // ما تلاش می‌کنیم اول با id بزنیم، اگر نبود با token.
  const sessionId = (sessionData as any)?.session?.id as string | undefined;
  const sessionToken = (sessionData as any)?.session?.token as
    | string
    | undefined;

  if (sessionId) {
    await prisma.session.update({
      where: { id: sessionId },
      data: { activeAssignmentId: assignment.id },
    });
  } else if (sessionToken) {
    await prisma.session.updateMany({
      where: { userId: sessionData.user.id, token: sessionToken },
      data: { activeAssignmentId: assignment.id },
    });
  } else {
    // اگر Better Auth در خروجی سشن این‌ها را ندهد، باید مدل/آداپتر را هماهنگ کنیم
    throw new Error("SESSION_IDENTIFIER_NOT_FOUND");
  }

  return { success: true };
}

/**
 * گرفتن کانتکست فعال برای استفاده در گاردها/صفحات
 */
export async function getCurrentContext() {
  const sessionData = await requireSession();

  const sessionId = sessionData.session?.id;
  const sessionToken = sessionData.session?.token;

  const dbSession = sessionId
    ? await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          user: true,
          activeAssignment: {
            include: {
              school: true,
              academicYear: true,
            },
          },
        },
      })
    : sessionToken
      ? await prisma.session.findFirst({
          where: {
            userId: sessionData.user.id,
            token: sessionToken,
          },
          include: {
            user: true,
            activeAssignment: {
              include: {
                school: true,
                academicYear: true,
              },
            },
          },
        })
      : null;

  if (!dbSession) {
    throw new Error("SESSION_NOT_FOUND");
  }

  if (!dbSession.user.isActive) {
    throw new Error("USER_INACTIVE");
  }

  const isMaster = dbSession.user.systemRole === "MASTER";

  // ✅ اصلاح: اگر isMaster هست یا activeAssignment ندارد، context را null برگردان
  const contextData =
    isMaster || !dbSession.activeAssignment
      ? null
      : {
          assignmentId: dbSession.activeAssignment.id,
          role: dbSession.activeAssignment.role as SchoolRole,
          school: dbSession.activeAssignment.school,
          academicYear: dbSession.activeAssignment.academicYear,
          // ✅ اضافه کردن schoolId و academicYearId برای دسترسی راحت‌تر
          schoolId: dbSession.activeAssignment.schoolId,
          academicYearId: dbSession.activeAssignment.academicYearId,
        };

  console.log("CTX", {
    userId: dbSession.user?.id,
    systemRole: dbSession.user?.systemRole,
    isMaster,
    hasActiveAssignment: !!dbSession?.activeAssignment,
    contextData,
  });

  return {
    user: dbSession.user,
    context: contextData,
    isMaster,
    // ✅ اضافه کردن فیلدهای کمکی برای دسترسی راحت‌تر
    schoolId: contextData?.schoolId ?? null,
    academicYearId: contextData?.academicYearId ?? null,
    role: contextData?.role ?? null,
    school: contextData?.school ?? null,
    academicYear: contextData?.academicYear ?? null,
  };
}

/**
 * لیست assignment های کاربر (فقط فعال‌ها)
 */

export async function getUserAssignments(onlyCurrentYear: boolean = false) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  console.log(
    "SESSION USER:",
    session?.user.systemRole,
    session?.user.isActive,
  );

  if (!session?.user?.id) throw new Error("کاربر یافت نشد");

  // پیدا کردن آخرین سال تحصیلی فعال در سیستم
  const latestYear = await prisma.academicYear.findFirst({
    where: { isActive: true },
    orderBy: { id: "desc" }, // فرض بر این است که ID بزرگتر یعنی سال جدیدتر
  });

  const assignments = await prisma.userAssignment.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
      school: { isActive: true },
      academicYear: {
        isActive: true,
        // اگر onlyCurrentYear تیک خورده بود، فقط سال آخر را بیاور
        ...(onlyCurrentYear && latestYear ? { id: latestYear.id } : {}),
      },
    },
    include: {
      school: true,
      academicYear: true,
    },
  });
  console.log("ACTIVE ASSIGNMENT:", assignments ?? null);
  return assignments;
}
