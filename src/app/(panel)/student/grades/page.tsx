import { redirect } from "next/navigation";
import { getCurrentContext } from "@/actions/authActions";
import { prisma } from "@/lib/prisma";
import { FileText } from "lucide-react";

export default async function StudentGradesPage() {
  const { user, context } = await getCurrentContext();

  if (!context?.schoolId || !context.academicYearId) {
    redirect("/student");
  }

  // چک تنظیمات
  const settings = await prisma.schoolSettings.findUnique({
    where: { schoolId: context.schoolId },
  });

  if (!settings?.showReportCardsInStudentPanel) {
    redirect("/student");
  }

  return (
    <div className="space-y-4">
      {/* هدر */}
      <div className="rounded-xl bg-gradient-to-l from-emerald-600 to-emerald-500 p-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold">کارنامه‌ها</h1>
            <p className="mt-1 text-sm text-emerald-100">
              کارنامه‌ها و نمرات شما
            </p>
          </div>
        </div>
      </div>

      {/* محتوای placeholder */}
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
        <FileText size={48} className="mx-auto mb-4 text-zinc-300" />
        <p className="text-sm font-medium text-zinc-600">
          کارنامه‌ها به زودی اضافه می‌شود
        </p>
        <p className="mt-2 text-xs text-zinc-400">
          پس از ثبت نمرات توسط معلمان، کارنامه شما در اینجا نمایش داده می‌شود.
        </p>
      </div>
    </div>
  );
}
