// src/app/dashboard/manager/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";

const ALLOWED_ROLES = ["MASTER"];

export default async function MasterLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || !ALLOWED_ROLES.includes(user.systemRole ?? "test")) {
    redirect("/login");
  }

  return <>{children}</>;
}
