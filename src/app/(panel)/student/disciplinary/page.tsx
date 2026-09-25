import { redirect } from "next/navigation";
import { getCurrentContext } from "@/actions/authActions";
import { prisma } from "@/lib/prisma";
import { convertGregorianToJalali } from "@/lib/dateUtils";
import { AlertTriangle } from "lucide-react";

export default async function StudentDisciplinaryPage() {
  const { user, context } = await getCurrentContext();

  if (!context?.schoolId || !context.academicYearId) {
    redirect("/student");
  }

  // چک تنظیمات
  const settings = await prisma.schoolSettings.findUnique({
    where: { schoolId: context.schoolId },
  });

  if (!settings?.showDisciplinaryInStudentPanel) {
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

  // دریافت موارد انضباطی
  const disciplinaries = await prisma.studentDisciplinary.findMany({
    where: { studentEnrollmentId: enrollment.id },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-4">
      {/* هدر */}
      <div className="rounded-xl bg-gradient-to-l from-rose-600 to-rose-500 p-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold">موارد انضباطی</h1>
            <p className="mt-1 text-sm text-rose-100">
              لیست موارد انضباطی ثبت‌شده برای شما
            </p>
          </div>
        </div>
      </div>

      {/* آمار */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-600">تعداد کل موارد انضباطی</span>
          <span className="text-2xl font-bold text-rose-600">
            {disciplinaries.length}
          </span>
        </div>
      </div>

      {/* جدول */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        {disciplinaries.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">
            مورد انضباطی برای شما ثبت نشده است. 🎉
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
                    ساعت
                  </th>
                  <th className="p-3 text-right font-medium text-zinc-600">
                    دلیل / توضیحات
                  </th>
                </tr>
              </thead>
              <tbody>
                {disciplinaries.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`border-t border-zinc-100 ${
                      idx % 2 === 0 ? "bg-white" : "bg-zinc-50/50"
                    }`}
                  >
                    <td className="p-3 text-zinc-500">{idx + 1}</td>
                    <td className="p-3 text-zinc-700">
                      {convertGregorianToJalali(new Date(item.date))}
                    </td>
                    <td className="p-3 text-zinc-600" dir="ltr">
                      {item.startTime}
                    </td>
                    <td className="p-3 text-zinc-700">
                      <span
                        className="line-clamp-2 max-w-[400px]"
                        title={item.reason}
                      >
                        {item.reason}
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
