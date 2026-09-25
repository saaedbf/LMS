import React, { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentContext } from "@/actions/authActions";
import { prisma } from "@/lib/prisma";
import StudentHeader from "./StudentHeader";

export default async function StudentLayout({
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

  // اگر دانش‌آموز نیست، به پنل خودش برود
  if (context.role !== "STUDENT") {
    if (context.role === "MANAGER" || context.role === "DEPUTY") {
      redirect("/dashboard");
    }
    if (context.role === "TEACHER") {
      redirect("/teacher");
    }
  }

  // ⬅️ خواندن تنظیمات مدرسه
  const settings = await prisma.schoolSettings.findUnique({
    where: { schoolId: context.schoolId },
    select: {
      showTuitionInStudentPanel: true,
      showDisciplinaryInStudentPanel: true,
      showAbsencesInStudentPanel: true,
      showReportCardsInStudentPanel: true,
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <StudentHeader
        schoolName={context.school.title}
        year={context.academicYear.title}
        userName={
          user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim()
        }
        showReportCards={settings?.showReportCardsInStudentPanel ?? true}
        showAbsences={settings?.showAbsencesInStudentPanel ?? true}
        showDisciplinary={settings?.showDisciplinaryInStudentPanel ?? true}
        showTuition={settings?.showTuitionInStudentPanel ?? true}
      />

      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
