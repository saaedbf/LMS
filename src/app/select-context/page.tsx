// app/(auth)/select-context/page.tsx  یا  app/select-context/page.tsx
import {
  getCurrentContext,
  getUserAssignments,
  setActiveContext,
} from "@/actions/authActions";
import { redirect } from "next/navigation";
import ContextSelectorClient from "./ContextSelectorClient";

// ⬅️ تابع کمکی برای تعیین مسیر بر اساس نقش
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

  if (!user) {
    redirect("/login");
  }

  if (user.isActive === false) {
    redirect("/login?error=account_disabled");
  }

  // ⬅️ Master همیشه به /dashboard می‌رود
  if (isMaster || user.systemRole === "MASTER") {
    redirect("/dashboard");
  }

  const assignments = await getUserAssignments(true);

  // اگر هیچ دسترسی فعالی نیست
  if (assignments.length === 0) {
    const allAssignments = await getUserAssignments(false);

    if (allAssignments.length === 0) {
      return (
        <div className="p-10 text-center">
          شما هیچ دسترسی فعالی در سیستم ندارید. با مدیر تماس بگیرید.
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <ContextSelectorClient
          initialAssignments={allAssignments}
          title="دسترسی‌های سال‌های گذشته"
        />
      </div>
    );
  }

  // ⬅️ اگر فقط یک دسترسی فعال دارد، مستقیم به پنل مربوطه برود
  if (assignments.length === 1) {
    const assignment = assignments[0];
    await setActiveContext(assignment.id);

    // ⬅️ بر اساس نقش، به پنل مربوطه هدایت شود
    const redirectPath = getRedirectPathByRole(assignment.role);
    redirect(redirectPath);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <ContextSelectorClient
        initialAssignments={assignments}
        title="انتخاب واحد آموزشی و نقش (سال جاری)"
      />
    </div>
  );
}
