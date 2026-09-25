import { redirect } from "next/navigation";
import { getCurrentContext } from "@/actions/authActions";
import { prisma } from "@/lib/prisma";
import { convertGregorianToJalali } from "@/lib/dateUtils";
import { Wallet, TrendingDown, TrendingUp, CheckCircle } from "lucide-react";
import { DEBT_TYPE_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/financialLabels";

export default async function StudentTuitionPage() {
  const { user, context } = await getCurrentContext();

  if (!context?.schoolId || !context.academicYearId) {
    redirect("/student");
  }

  // چک تنظیمات
  const settings = await prisma.schoolSettings.findUnique({
    where: { schoolId: context.schoolId },
  });

  if (!settings?.showTuitionInStudentPanel) {
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

  // دریافت تراکنش‌ها
  const transactions = await prisma.financialTransaction.findMany({
    where: { studentEnrollmentId: enrollment.id },
    orderBy: { date: "desc" },
  });

  // محاسبات
  const totalDebt = transactions
    .filter((t) => t.type === "DEBT")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalPayment = transactions
    .filter((t) => t.type === "PAYMENT")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalDebt - totalPayment;

  const formatAmount = (amount: number) => amount.toLocaleString("fa-IR");

  return (
    <div className="space-y-4">
      {/* هدر */}
      <div className="rounded-xl bg-gradient-to-l from-blue-600 to-blue-500 p-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            <Wallet size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold">وضعیت مالی</h1>
            <p className="mt-1 text-sm text-blue-100">
              خلاصه بدهکاری‌ها و پرداخت‌های شما
            </p>
          </div>
        </div>
      </div>

      {/* خلاصه */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm text-rose-600">
            <TrendingDown size={18} />
            جمع بدهکاری
          </div>
          <div className="text-2xl font-bold text-rose-700" dir="ltr">
            {formatAmount(totalDebt)}
          </div>
          <div className="text-xs text-rose-500">تومان</div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm text-emerald-600">
            <TrendingUp size={18} />
            جمع پرداخت
          </div>
          <div className="text-2xl font-bold text-emerald-700" dir="ltr">
            {formatAmount(totalPayment)}
          </div>
          <div className="text-xs text-emerald-500">تومان</div>
        </div>

        <div
          className={`rounded-xl border p-4 shadow-sm ${
            balance > 0
              ? "border-rose-300 bg-rose-100"
              : balance < 0
                ? "border-emerald-300 bg-emerald-100"
                : "border-zinc-300 bg-zinc-100"
          }`}
        >
          <div
            className={`mb-2 flex items-center gap-2 text-sm font-medium ${
              balance > 0
                ? "text-rose-700"
                : balance < 0
                  ? "text-emerald-700"
                  : "text-zinc-700"
            }`}
          >
            {balance === 0 ? <CheckCircle size={18} /> : <Wallet size={18} />}
            {balance > 0
              ? "مانده بدهکاری"
              : balance < 0
                ? "مانده بستانکاری"
                : "تسویه"}
          </div>
          <div
            className={`text-2xl font-bold ${
              balance > 0
                ? "text-rose-700"
                : balance < 0
                  ? "text-emerald-700"
                  : "text-zinc-700"
            }`}
            dir="ltr"
          >
            {formatAmount(Math.abs(balance))}
          </div>
          <div
            className={`text-xs ${
              balance > 0
                ? "text-rose-500"
                : balance < 0
                  ? "text-emerald-500"
                  : "text-zinc-500"
            }`}
          >
            تومان
          </div>
        </div>
      </div>

      {/* جدول تراکنش‌ها */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-3">
          <h2 className="text-sm font-bold text-zinc-800">تراکنش‌ها</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">
            تراکنشی برای شما ثبت نشده است.
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
                    نوع
                  </th>
                  <th className="p-3 text-right font-medium text-zinc-600">
                    دسته‌بندی
                  </th>
                  <th className="p-3 text-right font-medium text-zinc-600">
                    مبلغ (تومان)
                  </th>
                  <th className="p-3 text-right font-medium text-zinc-600">
                    تاریخ
                  </th>
                  <th className="p-3 text-right font-medium text-zinc-600">
                    شرح
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, idx) => {
                  const isDebt = t.type === "DEBT";
                  return (
                    <tr
                      key={t.id}
                      className={`border-t border-zinc-100 ${
                        idx % 2 === 0 ? "bg-white" : "bg-zinc-50/50"
                      }`}
                    >
                      <td className="p-3 text-zinc-500">{idx + 1}</td>
                      <td className="p-3">
                        {isDebt ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700">
                            <TrendingDown size={10} />
                            بدهکاری
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                            <TrendingUp size={10} />
                            پرداخت
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-zinc-600">
                        {isDebt
                          ? DEBT_TYPE_LABELS[t.debtType || ""] || "-"
                          : PAYMENT_METHOD_LABELS[t.paymentMethod || ""] || "-"}
                      </td>
                      <td
                        className={`p-3 font-bold ${
                          isDebt ? "text-rose-600" : "text-emerald-600"
                        }`}
                        dir="ltr"
                      >
                        {formatAmount(Number(t.amount))}
                      </td>
                      <td className="p-3 text-zinc-700">
                        {convertGregorianToJalali(new Date(t.date))}
                      </td>
                      <td className="p-3 text-zinc-500">
                        <span
                          className="line-clamp-1 max-w-[200px]"
                          title={t.description || "-"}
                        >
                          {t.description || "-"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
