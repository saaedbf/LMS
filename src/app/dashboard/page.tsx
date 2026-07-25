// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  switch (user.role) {
    case "MASTER":
    case "MANAGER":
    case "ADMIN":
      redirect("/dashboard/manager");
    case "SCHOOL":
      redirect("/dashboard/school");
    case "TEACHER":
      redirect("/dashboard/teacher");
    case "STUDENT":
      redirect("/dashboard/student");
    default:
      redirect("/login");
  }
}
