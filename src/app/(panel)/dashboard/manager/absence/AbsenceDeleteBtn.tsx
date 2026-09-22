"use client";

import { useState, useTransition } from "react";
import { toast } from "react-toastify";
import { deleteAbsenceAction } from "@/actions/absenceActions";
import DeleteBtn from "@/components/widgets/Elements/DeleteBtn";

type Props = {
  absenceId: string;
};

export default function AbsenceDeleteBtn({ absenceId }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        // اصلاح: ارسال object با کلید id
        const result = await deleteAbsenceAction({ id: absenceId });

        if (result.status === "error") {
          toast.error(result.error.toString() || "خطا در حذف غیبت");
        } else {
          toast.success("غیبت با موفقیت حذف شد");
          // بستن مودال پس از موفقیت
          setShowConfirm(false);
        }
      } catch (error) {
        console.error(error);
        toast.error("خطا در حذف غیبت");
      }
    });
  };

  return (
    <>
      <DeleteBtn
        onClick={() => setShowConfirm(true)}
        title="حذف"
        className="rounded-md bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/60"
      ></DeleteBtn>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-xl bg-white p-5 shadow-lg dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              تایید حذف غیبت
            </h3>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
              آیا از حذف این رکورد غیبت مطمئن هستید؟ این عملیات قابل بازگشت
              نیست.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                انصراف
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-lg bg-rose-600 px-5 py-2 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
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
