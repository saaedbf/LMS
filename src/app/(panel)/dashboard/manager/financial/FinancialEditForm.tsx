"use client";

import { useState, useTransition } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { toast } from "react-toastify";
import { updateFinancialTransactionAction } from "@/actions/financialActions";
import { convertJalaliToGregorian } from "@/lib/dateUtils";
import {
  DEBT_TYPE_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
} from "@/lib/financialLabels";

interface Props {
  transaction: {
    id: string;
    type: "DEBT" | "PAYMENT";
    amount: number;
    debtType: string | null;
    paymentMethod: string | null;
    date: string | Date;
    description: string | null;
    studentName: string;
  };
  setOpen: (open: boolean) => void;
}

export default function FinancialEditForm({ transaction, setOpen }: Props) {
  const getInitialDateStr = () => {
    const d = new Date(transaction.date);
    return d;
  };

  const [date, setDate] = useState<Date>(getInitialDateStr());
  const [amount, setAmount] = useState(String(transaction.amount));
  const [description, setDescription] = useState(transaction.description || "");
  const [debtType, setDebtType] = useState(transaction.debtType || "TUITION");
  const [paymentMethod, setPaymentMethod] = useState(
    transaction.paymentMethod || "CASH",
  );
  const [isPending, startTransition] = useTransition();

  const isDebt = transaction.type === "DEBT";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      toast.error("مبلغ را وارد کنید");
      return;
    }

    startTransition(async () => {
      const gregorianDate = convertJalaliToGregorian(date);

      const res = await updateFinancialTransactionAction({
        id: transaction.id,
        amount: Number(amount),
        date: gregorianDate.toISOString(),
        description: description.trim() || undefined,
        ...(isDebt
          ? { debtType: debtType as any }
          : { paymentMethod: paymentMethod as any }),
      });

      if (res.status === "error") {
        toast.error(res.error.toString());
      } else {
        toast.success("تراکنش با موفقیت ویرایش شد");
        setOpen(false);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 text-sm">
      <div className="rounded-lg bg-zinc-50 p-3 text-xs">
        دانش‌آموز: <strong>{transaction.studentName}</strong>
        <br />
        نوع:{" "}
        <strong className={isDebt ? "text-rose-600" : "text-emerald-600"}>
          {isDebt ? "بدهکاری" : "پرداخت"}
        </strong>
      </div>

      {/* نوع / روش */}
      <div>
        <label className="mb-1 block font-medium text-zinc-700">
          {isDebt ? "نوع بدهکاری" : "روش پرداخت"}
        </label>
        {isDebt ? (
          <select
            value={debtType}
            onChange={(e) => setDebtType(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 p-2 text-sm"
          >
            {DEBT_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 p-2 text-sm"
          >
            {PAYMENT_METHOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* تاریخ */}
      <div>
        <label className="mb-1 block font-medium text-zinc-700">
          تاریخ (شمسی)
        </label>
        <DatePicker
          value={date}
          onChange={(d: any) => {
            if (d) setDate(d.toDate ? d.toDate() : new Date(d));
          }}
          calendar={persian}
          locale={persian_fa}
          calendarPosition="bottom-right"
          format="YYYY/MM/DD"
          containerClassName="w-full"
          inputClass="w-full rounded-lg border border-zinc-300 p-2 text-sm text-right"
          editable={false}
        />
      </div>

      {/* مبلغ */}
      <div>
        <label className="mb-1 block font-medium text-zinc-700">
          مبلغ (تومان)
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={amount ? Number(amount).toLocaleString("en-US") : ""}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
          className="w-full rounded-lg border border-zinc-300 p-2 text-sm text-left"
          dir="ltr"
        />
        {amount && (
          <p className="mt-1 text-xs text-zinc-500">
            {Number(amount).toLocaleString("fa-IR")} تومان
          </p>
        )}
      </div>

      {/* شرح */}
      <div>
        <label className="mb-1 block font-medium text-zinc-700">
          شرح (اختیاری)
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 p-2 text-sm"
        />
      </div>

      <div className="flex justify-end gap-2 pt-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-xs font-medium"
        >
          انصراف
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "در حال ثبت..." : "ذخیره تغییرات"}
        </button>
      </div>
    </form>
  );
}
