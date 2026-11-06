import { redirect } from "next/navigation";
import { getCurrentContext } from "@/actions/authActions";
import { prisma } from "@/lib/prisma";
import { FileText } from "lucide-react";
import {
  getStudentGradePeriods,
  getStudentEnrollmentId,
} from "@/actions/studentReportActions";
import StudentReportForm from "./StudentReportForm";

export default async function StudentGradesPage() {
  const context = await getCurrentContext();

  if (!context?.schoolId || !context.academicYearId) {
    redirect("/student");
  }

  // چک تنظیمات مدرسه برای نمایش کارنامه
  const settings = await prisma.schoolSettings.findUnique({
    where: { schoolId: context.schoolId },
  });

  if (!settings?.showReportCardsInStudentPanel) {
    redirect("/student");
  }

  // گرفتن لیست دوره‌ها و شناسه ثبت‌نام
  const [periods, enrollmentId] = await Promise.all([
    getStudentGradePeriods(),
    getStudentEnrollmentId(),
  ]);

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
              مشاهده نمرات و رتبه‌ها
            </p>
          </div>
        </div>
      </div>

      {/* کامپوننت انتخاب دوره و نمایش کارنامه */}
      {enrollmentId ? (
        <StudentReportForm periods={periods} enrollmentId={enrollmentId} />
      ) : (
        <div className="rounded-xl bg-rose-50 p-6 text-center text-rose-600">
          ثبت‌نامی برای شما در این سال تحصیلی یافت نشد.
        </div>
      )}
    </div>
  );
}
