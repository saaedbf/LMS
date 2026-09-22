// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getCurrentContext } from "@/actions/authActions";

export default async function DashboardPage() {
  const { user, context, isMaster } = await getCurrentContext();

  if (!user) {
    redirect("/login");
  }

  if (user.isActive === false) {
    redirect("/login?error=account_disabled");
  }

  // ✅ نقش سیستمی MASTER → پنل مدیریت کل
  if (isMaster) {
    redirect("/dashboard/master");
  }

  // ✅ کاربران غیر MASTER باید context داشته باشند
  if (!context) {
    redirect("/select-context");
  }

  // ⬅️ بر اساس نقش، به پنل مربوطه هدایت شود
  switch (context.role) {
    case "MANAGER":
    case "DEPUTY":
      redirect("/dashboard/manager");

    case "TEACHER":
      redirect("/teacher"); // ⬅️ تغییر: از /dashboard/teacher به /teacher

    case "STUDENT":
      redirect("/student"); // ⬅️ تغییر: از /dashboard/student به /student

    default:
      redirect("/select-context");
  }
}
