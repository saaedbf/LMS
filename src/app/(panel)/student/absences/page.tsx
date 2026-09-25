import { redirect } from "next/navigation";
import { getCurrentContext } from "@/actions/authActions";
import { prisma } from "@/lib/prisma";
import { convertGregorianToJalali } from "@/lib/dateUtils";
import { CalendarX, CalendarDays } from "lucide-react";

export default async function StudentAbsencesPage() {
  const { user, context } = await getCurrentContext();

  if (!context?.schoolId || !context.academicYearId) {
    redirect("/student");
  }

  // چک تنظیمات
  const settings = await prisma.schoolSettings.findUnique({
    where: { schoolId: context.schoolId },
  });

  if (!settings?.showAbsencesInStudentPanel) {
    redirect("/student");
  }

  // پیدا کردن دانش‌آموز
  const email = user?.email || "";
  const nationalCode = email.split("@")[0];

  const student = await prisma.student.findUnique({
    where: { nationalCode },
    select: { id: true, firstName: true, lastName: true },
  });

  if (!student) {
    redirect("/student");
  }

  // پیدا کردن ثبت‌نام
  const enrollment = await prisma.studentEnrollment.findFirst({
    where: {
      studentId: student.id,
      schoolId: context.schoolId,
      academicYearId: context.academicYearId,
    },
  });

  if (!enrollment) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
        <p className="text-sm text-zinc-500">ثبت‌نامی برای شما یافت نشد.</p>
      </div>
    );
  }

  // دریافت غیبت‌ها
  const absences = await prisma.studentAbsence.findMany({
    where: { studentEnrollmentId: enrollment.id },
    orderBy: { date: "desc" },
  });

  // آمار
  const totalAbsences = absences.length;
  const excused = absences.filter((a) => a.absenceType === "EXCUSED").length;
  const unexcused = absences.filter(
    (a) => a.absenceType === "UNEXCUSED",
  ).length;
  const unknown = absences.filter((a) => a.absenceType === "UNKNOWN").length;

  return (
    <div className="space-y-4">
      {/* هدر */}
      <div className="rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 p-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            <CalendarX size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold">غیبت‌های من</h1>
            <p className="mt-1 text-sm text-amber-100">
              لیست غیبت‌های ثبت‌شده برای شما
            </p>
          </div>
        </div>
      </div>

      {/* آمار */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-zinc-500">کل غیبت‌ها</div>
          <div className="mt-1 text-2xl font-bold text-zinc-800">
            {totalAbsences}
          </div>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <div className="text-xs text-emerald-600">موجه</div>
          <div className="mt-1 text-2xl font-bold text-emerald-700">
            {excused}
          </div>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
          <div className="text-xs text-rose-600">غیرموجه</div>
          <div className="mt-1 text-2xl font-bold text-rose-700">
            {unexcused}
          </div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="text-xs text-amber-600">نامشخص</div>
          <div className="mt-1 text-2xl font-bold text-amber-700">
            {unknown}
          </div>
        </div>
      </div>

      {/* جدول */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        {absences.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">
            غیبتی برای شما ثبت نشده است. 🎉
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="p-3 text-right font-medium text-zinc-600">
                    #
                  </th>
                  <th className="p-3 text-right font-medium text-zinc-600">
                    تاریخ
                  </th>
                  <th className="p-3 text-right font-medium text-zinc-600">
                    بازه زمانی
                  </th>
                  <th className="p-3 text-right font-medium text-zinc-600">
                    وضعیت
                  </th>
                  <th className="p-3 text-right font-medium text-zinc-600">
                    دلیل
                  </th>
                </tr>
              </thead>
              <tbody>
                {absences.map((absence, idx) => (
                  <tr
                    key={absence.id}
                    className={`border-t border-zinc-100 ${
                      idx % 2 === 0 ? "bg-white" : "bg-zinc-50/50"
                    }`}
                  >
                    <td className="p-3 text-zinc-500">{idx + 1}</td>
                    <td className="p-3 text-zinc-700">
                      {convertGregorianToJalali(new Date(absence.date))}
                    </td>
                    <td className="p-3 text-zinc-600" dir="ltr">
                      {absence.isFullDay ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700">
                          <CalendarDays size={10} />
                          روز کامل
                        </span>
                      ) : (
                        `${absence.startTime} - ${absence.endTime}`
                      )}
                    </td>
                    <td className="p-3">
                      {absence.absenceType === "EXCUSED" && (
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                          موجه
                        </span>
                      )}
                      {absence.absenceType === "UNEXCUSED" && (
                        <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700">
                          غیرموجه
                        </span>
                      )}
                      {absence.absenceType === "UNKNOWN" && (
                        <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                          نامشخص
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-zinc-500">
                      <span
                        className="line-clamp-1 max-w-[200px]"
                        title={absence.reason || "-"}
                      >
                        {absence.reason || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
