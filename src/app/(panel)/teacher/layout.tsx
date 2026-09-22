// app/(panel)/teacher/layout.tsx
import React, { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentContext } from "@/actions/authActions";
import TeacherHeader from "./TeacherHeader";

export default async function TeacherLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, context } = await getCurrentContext();

  if (!user) {
    redirect("/login");
  }

  if (user.isActive === false) {
    redirect("/login?error=account_disabled");
  }

  if (!context) {
    redirect("/select-context");
  }

  // ⬅️ اگر معلم نیست، به پنل خودش برود
  if (context.role !== "TEACHER") {
    if (context.role === "MANAGER" || context.role === "DEPUTY") {
      redirect("/dashboard");
    }
    if (context.role === "STUDENT") {
      redirect("/student");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TeacherHeader
        schoolName={context.school.title}
        year={context.academicYear.title}
        userName={
          user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim()
        }
      />

      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
