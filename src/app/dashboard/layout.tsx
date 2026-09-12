import React, { ReactNode } from "react";
import { redirect } from "next/navigation";
import Header from "@/components/layout/header/Header";
import NewAside from "@/components/layout/aside/NewAside";
import { getCurrentContext } from "@/actions/authActions";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, context, isMaster } = await getCurrentContext();

  if (!user) {
    redirect("/login");
  }

  if (user.isActive === false) {
    redirect("/login?error=account_disabled");
  }

  if (!isMaster && !context) {
    redirect("/select-context");
  }

  return (
    <div className="flex h-screen">
      <NewAside user={user} role={context?.role ?? null} />

      <main className="flex-1 overflow-y-auto">
        <Header
          schoolName={isMaster ? "پنل مدیریت کل" : context!.school.title}
          year={isMaster ? "-" : context!.academicYear.title}
        />
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
}
