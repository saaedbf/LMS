// lib/auth-helpers.ts
"use server";

import { getCurrentContext } from "@/actions/authActions";
import { Permission } from "@/lib/permissions";
import type { Scope, ScopeError } from "./auth-helpers-utils";

export async function getScope(
  requiredPermission?: Permission | null,
  options?: { managerOnly?: boolean },
): Promise<Scope | ScopeError> {
  const context = await getCurrentContext();

  if (!context?.user) {
    return { error: "ابتدا وارد شوید" };
  }

  if (!context.schoolId || !context.academicYearId) {
    return { error: "کانتکست فعال یافت نشد" };
  }

  const isManager = context.role === "MANAGER";
  const isDeputy = context.role === "DEPUTY";

  if (!isManager && !isDeputy) {
    return { error: "شما دسترسی لازم را ندارید" };
  }

  if (options?.managerOnly && !isManager) {
    return { error: "فقط مدیر می‌تواند این عملیات را انجام دهد" };
  }

  if (requiredPermission) {
    const hasPermission = context.permissions?.includes(requiredPermission);

    if (!isManager && !hasPermission) {
      return { error: "شما دسترسی لازم برای این عملیات را ندارید" };
    }
  }

  return {
    schoolId: context.schoolId,
    academicYearId: context.academicYearId,
    role: context.role!,
    userId: context.user.id,
    username:
      (context.user as any).username ||
      context.user.email ||
      context.user.name ||
      context.user.id,
    isManager,
    isDeputy,
    permissions: context.permissions ?? [],
  };
}
