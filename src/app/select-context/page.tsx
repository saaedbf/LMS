import {
  getCurrentContext,
  getUserAssignments,
  setActiveContext,
} from "@/actions/authActions";
import { redirect } from "next/navigation";
import ContextSelectorClient from "./ContextSelectorClient";

export default async function SelectContextPage() {
  const { user, isMaster } = await getCurrentContext();

  if (!user) {
    redirect("/login");
  }

  if (user.isActive === false) {
    redirect("/login?error=account_disabled");
  }

  if (isMaster || user.systemRole === "MASTER") {
    redirect("/dashboard");
  }

  const assignments = await getUserAssignments(true);

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

  if (assignments.length === 1) {
    await setActiveContext(assignments[0].id);
    redirect("/dashboard");
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
