// src/app/dashboard/layout.tsx
import React, { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import Header from "@/components/layout/header/Header";
import NewAside from "@/components/layout/aside/NewAside";

export default async function Dashboardlayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.isActive === false) {
    redirect("/login?error=account_disabled");
  }

  return (
    <div className="flex">
      <NewAside />
      <main className="flex-1">
        <Header />
        {children}
      </main>
    </div>
  );
}
