// src/app/dashboard/manager/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";

const ALLOWED_ROLES = ["MASTER", "MANAGER", "ADMIN"];

export default async function ManagerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!ALLOWED_ROLES.includes(user?.role ?? "")) {
    redirect("/dashboard"); // اگر دسترسی نداشت برمی‌گردد به داشبورد اصلی خودش
  }

  return <>{children}</>;
}
