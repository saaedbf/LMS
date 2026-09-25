"use client";

import { useState, useTransition } from "react";
import { toast } from "react-toastify";
import { deleteFinancialTransactionAction } from "@/actions/financialActions";
import { Trash2 } from "lucide-react";

type Props = {
  transactionId: string;
  studentName: string;
  amount: number;
};

export default function FinancialDeleteBtn({
  transactionId,
  studentName,
  amount,
}: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteFinancialTransactionAction({
          id: transactionId,
        });

        if (result.status === "error") {
          toast.error(result.error.toString());
        } else {
          toast.success("تراکنش با موفقیت حذف شد");
          setShowConfirm(false);
        }
      } catch (error) {
        console.error(error);
        toast.error("خطا در حذف تراکنش");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        title="حذف"
        className="rounded-md bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100"
      >
        <Trash2 size={14} />
      </button>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-xl bg-white p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-zinc-900">
              تایید حذف تراکنش
            </h3>
            <p className="mt-2 text-xs text-zinc-600">
              آیا از حذف تراکنش{" "}
              <strong>{Number(amount).toLocaleString("fa-IR")} تومان</strong>{" "}
              برای دانش‌آموز <strong>{studentName}</strong> مطمئن هستید؟
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-xs"
              >
                انصراف
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-lg bg-rose-600 px-5 py-2 text-xs text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {isPending ? "در حال حذف..." : "حذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
