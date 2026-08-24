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

  // ✅ نقش سیستمی MASTER
  if (isMaster) {
    redirect("/dashboard/master");
  }

  // ✅ کاربران غیر MASTER باید context داشته باشند
  if (!context) {
    redirect("/select-context");
  }

  switch (context.role) {
    case "MANAGER":
      redirect("/dashboard/manager");

    case "TEACHER":
      redirect("/dashboard/teacher");

    case "STUDENT":
      redirect("/dashboard/student");

    default:
      redirect("/select-context");
  }
}
