import {
  getCurrentContext,
  getUserAssignments,
  setActiveContext,
} from "@/actions/authActions";
import { redirect } from "next/navigation";
import ContextSelectorClient from "./ContextSelectorClient";

function getRedirectPathByRole(role: string | null): string {
  switch (role) {
    case "MANAGER":
    case "DEPUTY":
      return "/dashboard";
    case "TEACHER":
      return "/teacher";
    case "STUDENT":
      return "/student";
    default:
      return "/dashboard";
  }
}

export default async function SelectContextPage() {
  const { user, isMaster } = await getCurrentContext();

  if (!user) redirect("/login");
  if (user.isActive === false) redirect("/login?error=account_disabled");
  if (isMaster || user.systemRole === "MASTER") redirect("/dashboard");

  const assignments = await getUserAssignments(false);

  if (assignments.length === 0) {
    return (
      <div className="p-10 text-center">
        شما هیچ دسترسی فعالی در سیستم ندارید. با مدیر تماس بگیرید.
      </div>
    );
  }

  // ⬇⬇ اگر فقط معلم است (حتی چند مدرسه) → یک بار انتخاب نقش
  const isOnlyTeacher = assignments.every((a) => a.role === "TEACHER");

  if (isOnlyTeacher) {
    // اولین assignment (معلم) را فعال کن و برو /teacher
    await setActiveContext(assignments[0].id);
    redirect("/teacher");
  }

  // ⬇⬇ اگر فقط یک نقش دیگر دارد (مثلاً فقط کادر)
  if (assignments.length === 1) {
    await setActiveContext(assignments[0].id);
    redirect(getRedirectPathByRole(assignments[0].role));
  }

  // ⬇⬇ چند نقش → صفحه انتخاب
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <ContextSelectorClient
        initialAssignments={assignments}
        title="انتخاب واحد آموزشی و نقش"
      />
    </div>
  );
}
