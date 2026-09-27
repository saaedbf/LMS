"use server";

import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SchoolRole } from "@prisma/client";

const IS_DEV = process.env.NODE_ENV === "development";

/**
 * انتخاب کانتکست فعال برای سشن جاری
 */
export async function setActiveContext(assignmentId: number) {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionData?.user?.id || !sessionData?.session?.id) {
    throw new Error("UNAUTHORIZED");
  }

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

  if (!assignment) throw new Error("FORBIDDEN");

  await prisma.session.update({
    where: { id: sessionData.session.id },
    data: { activeAssignmentId: assignment.id },
  });

  return { success: true };
}

/**
 * گرفتن کانتکست فعال
 */
export async function getCurrentContext() {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionData?.user?.id || !sessionData?.session?.id) {
    throw new Error("UNAUTHORIZED");
  }

  const dbSession = await prisma.session.findUnique({
    where: { id: sessionData.session.id },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          firstName: true,
          lastName: true,
          systemRole: true,
          isActive: true,
          role: true,
          image: true,
        },
      },
      activeAssignment: {
        select: {
          id: true,
          role: true,
          schoolId: true,
          academicYearId: true,
          school: {
            select: { id: true, title: true, oppositeSchoolId: true },
          },
          academicYear: {
            select: { id: true, title: true },
          },
        },
      },
    },
  });

  if (!dbSession) throw new Error("SESSION_NOT_FOUND");
  if (!dbSession.user.isActive) throw new Error("USER_INACTIVE");

  const isMaster = dbSession.user.systemRole === "MASTER";

  const contextData =
    isMaster || !dbSession.activeAssignment
      ? null
      : {
          assignmentId: dbSession.activeAssignment.id,
          role: dbSession.activeAssignment.role as SchoolRole,
          school: dbSession.activeAssignment.school,
          academicYear: dbSession.activeAssignment.academicYear,
          schoolId: dbSession.activeAssignment.schoolId,
          academicYearId: dbSession.activeAssignment.academicYearId,
        };

  let permissions: string[] = [];

  if (contextData?.role === "DEPUTY") {
    const deputy = await prisma.deputy.findUnique({
      where: { userId: dbSession.user.id },
      select: {
        permissions: { select: { permission: true } },
      },
    });

    if (deputy) {
      permissions = deputy.permissions.map((p) => p.permission);
    }
  }

  if (IS_DEV) {
    console.log("[CTX]", {
      userId: dbSession.user.id,
      role: contextData?.role,
      isMaster,
    });
  }

  return {
    user: dbSession.user,
    context: contextData,
    isMaster,
    schoolId: contextData?.schoolId ?? null,
    academicYearId: contextData?.academicYearId ?? null,
    role: contextData?.role ?? null,
    school: contextData?.school ?? null,
    academicYear: contextData?.academicYear ?? null,
    permissions,
  };
}

/**
 * لیست assignment های کاربر
 */
export async function getUserAssignments(onlyCurrentYear: boolean = false) {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionData?.user?.id) throw new Error("کاربر یافت نشد");

  const where: any = {
    userId: sessionData.user.id,
    isActive: true,
    school: { isActive: true },
    academicYear: { isActive: true },
  };

  if (onlyCurrentYear) {
    const latestYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
      orderBy: { id: "desc" },
      select: { id: true },
    });

    if (latestYear) {
      where.academicYear = {
        isActive: true,
        id: latestYear.id,
      };
    }
  }

  return prisma.userAssignment.findMany({
    where,
    select: {
      id: true,
      role: true,
      schoolId: true,
      academicYearId: true,
      school: { select: { id: true, title: true } },
      academicYear: { select: { id: true, title: true } },
    },
  });
}
