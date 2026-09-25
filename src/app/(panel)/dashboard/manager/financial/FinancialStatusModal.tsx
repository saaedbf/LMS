"use client";

import { useState, useEffect } from "react";
import ActionModal from "@/components/widgets/ActionModal";
import { Wallet, TrendingDown, TrendingUp, Loader2 } from "lucide-react";
import { getStudentFinancialSummary } from "@/actions/financialActions";
import { convertGregorianToJalali } from "@/lib/dateUtils";
import { DEBT_TYPE_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/financialLabels";

type Props = {
  enrollmentId: string;
  studentName: string;
};

export default function FinancialStatusModal({
  enrollmentId,
  studentName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  // بارگذاری هنگام باز شدن
  useEffect(() => {
    if (open && !data) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getStudentFinancialSummary(enrollmentId);
      if (res.status === "success") {
        setData(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("fa-IR");
  };

  return (
    <ActionModal
      title={`وضعیت مالی - ${studentName}`}
      desc="خلاصه بدهکاری‌ها و پرداخت‌های دانش‌آموز"
      open={open}
      setOpen={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          // اختیاری: پاک کردن data برای بارگذاری مجدد
          // setData(null);
        }
      }}
      contentClassName="w-[95vw] max-w-3xl"
      trigger={
        <button
          type="button"
          title="وضعیت مالی"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-blue-300 bg-blue-50 px-2.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
        >
          <Wallet size={14} />
          وضعیت مالی
        </button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="animate-spin text-blue-500" size={24} />
        </div>
      ) : !data ? (
        <div className="p-8 text-center text-sm text-zinc-500">
          اطلاعاتی برای نمایش وجود ندارد
        </div>
      ) : (
        <div className="space-y-4 p-4">
          {/* خلاصه بالای مودال */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-center">
              <div className="mb-1 flex items-center justify-center gap-1 text-xs text-rose-600">
                <TrendingDown size={14} />
                جمع بدهکاری
              </div>
              <div className="text-base font-bold text-rose-700" dir="ltr">
                {formatAmount(data.totalDebt)}
              </div>
              <div className="text-[10px] text-rose-500">تومان</div>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
              <div className="mb-1 flex items-center justify-center gap-1 text-xs text-emerald-600">
                <TrendingUp size={14} />
                جمع پرداخت
              </div>
              <div className="text-base font-bold text-emerald-700" dir="ltr">
                {formatAmount(data.totalPayment)}
              </div>
              <div className="text-[10px] text-emerald-500">تومان</div>
            </div>

            <div
              className={`rounded-lg border p-3 text-center ${
                data.balance > 0
                  ? "border-rose-300 bg-rose-100"
                  : data.balance < 0
                    ? "border-emerald-300 bg-emerald-100"
                    : "border-zinc-300 bg-zinc-100"
              }`}
            >
              <div
                className={`mb-1 text-xs font-medium ${
                  data.balance > 0
                    ? "text-rose-700"
                    : data.balance < 0
                      ? "text-emerald-700"
                      : "text-zinc-700"
                }`}
              >
                {data.balance > 0
                  ? "مانده بدهکاری"
                  : data.balance < 0
                    ? "مانده بستانکاری"
                    : "تسویه"}
              </div>
              <div
                className={`text-base font-bold ${
                  data.balance > 0
                    ? "text-rose-700"
                    : data.balance < 0
                      ? "text-emerald-700"
                      : "text-zinc-700"
                }`}
                dir="ltr"
              >
                {formatAmount(Math.abs(data.balance))}
              </div>
              <div
                className={`text-[10px] ${
                  data.balance > 0
                    ? "text-rose-500"
                    : data.balance < 0
                      ? "text-emerald-500"
                      : "text-zinc-500"
                }`}
              >
                تومان
              </div>
            </div>
          </div>

          {/* جدول تراکنش‌ها */}
          <div className="overflow-hidden rounded-lg border border-zinc-200">
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-zinc-100">
                  <tr>
                    <th className="p-2 text-right font-medium text-zinc-600">
                      #
                    </th>
                    <th className="p-2 text-right font-medium text-zinc-600">
                      نوع
                    </th>
                    <th className="p-2 text-right font-medium text-zinc-600">
                      دسته‌بندی
                    </th>
                    <th className="p-2 text-right font-medium text-zinc-600">
                      مبلغ (تومان)
                    </th>
                    <th className="p-2 text-right font-medium text-zinc-600">
                      تاریخ
                    </th>
                    <th className="p-2 text-right font-medium text-zinc-600">
                      شرح
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-zinc-400">
                        تراکنشی ثبت نشده است
                      </td>
                    </tr>
                  ) : (
                    data.transactions.map((t: any, idx: number) => {
                      const isDebt = t.type === "DEBT";
                      return (
                        <tr
                          key={t.id}
                          className={`border-t border-zinc-100 ${
                            idx % 2 === 0 ? "bg-white" : "bg-zinc-50/50"
                          }`}
                        >
                          <td className="p-2 text-zinc-500">{idx + 1}</td>
                          <td className="p-2">
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
                          <td className="p-2 text-zinc-600">
                            {isDebt
                              ? DEBT_TYPE_LABELS[t.debtType || ""] || "-"
                              : PAYMENT_METHOD_LABELS[t.paymentMethod || ""] ||
                                "-"}
                          </td>
                          <td
                            className={`p-2 font-bold ${
                              isDebt ? "text-rose-600" : "text-emerald-600"
                            }`}
                            dir="ltr"
                          >
                            {formatAmount(t.amount)}
                          </td>
                          <td className="p-2 text-zinc-600">
                            {convertGregorianToJalali(new Date(t.date))}
                          </td>
                          <td className="p-2 text-zinc-500">
                            <span
                              className="line-clamp-1 max-w-[150px]"
                              title={t.description || "-"}
                            >
                              {t.description || "-"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {/* ⬅️ جمع‌ها در پایین جدول */}
                {data.transactions.length > 0 && (
                  <tfoot className="sticky bottom-0 bg-zinc-100 font-bold">
                    <tr className="border-t-2 border-zinc-300">
                      <td colSpan={3} className="p-2 text-right text-zinc-700">
                        جمع بدهکاری:
                      </td>
                      <td className="p-2 text-rose-600" dir="ltr">
                        {formatAmount(data.totalDebt)}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                    <tr className="border-t border-zinc-200">
                      <td colSpan={3} className="p-2 text-right text-zinc-700">
                        جمع پرداخت:
                      </td>
                      <td className="p-2 text-emerald-600" dir="ltr">
                        {formatAmount(data.totalPayment)}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                    <tr
                      className={`border-t-2 ${
                        data.balance > 0
                          ? "border-rose-300 bg-rose-50"
                          : data.balance < 0
                            ? "border-emerald-300 bg-emerald-50"
                            : "border-zinc-300 bg-zinc-50"
                      }`}
                    >
                      <td
                        colSpan={3}
                        className={`p-2 text-right font-bold ${
                          data.balance > 0
                            ? "text-rose-700"
                            : data.balance < 0
                              ? "text-emerald-700"
                              : "text-zinc-700"
                        }`}
                      >
                        {data.balance > 0
                          ? "مانده بدهکاری:"
                          : data.balance < 0
                            ? "مانده بستانکاری:"
                            : "تسویه:"}
                      </td>
                      <td
                        className={`p-2 font-bold ${
                          data.balance > 0
                            ? "text-rose-700"
                            : data.balance < 0
                              ? "text-emerald-700"
                              : "text-zinc-700"
                        }`}
                        dir="ltr"
                      >
                        {formatAmount(Math.abs(data.balance))}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}
      {/* ⬅️ دکمه بستن */}
      <div className="flex justify-end gap-2 border-t border-zinc-200 p-4">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-zinc-300 px-6 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
        >
          بستن
        </button>
      </div>
    </ActionModal>
  );
}
