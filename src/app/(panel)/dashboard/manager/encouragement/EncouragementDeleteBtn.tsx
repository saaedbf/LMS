"use client";

import { useState, useTransition } from "react";
import { toast } from "react-toastify";
import { deleteEncouragementAction } from "@/actions/encouragementActions";
import DeleteBtn from "@/components/widgets/Elements/DeleteBtn";

type Props = { id: string };

export default function EncouragementDeleteBtn({ id }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteEncouragementAction({ id });
      if (result.status === "error") {
        toast.error(result.error.toString());
      } else {
        toast.success("با موفقیت حذف شد");
        setShowConfirm(false);
      }
    });
  };

  return (
    <>
      <DeleteBtn onClick={() => setShowConfirm(true)} title="حذف" />
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-xl bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold">تایید حذف</h3>
            <p className="mt-2 text-xs text-zinc-600">
              آیا از حذف این رکورد تشویق مطمئن هستید؟
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-lg border px-4 py-2 text-xs"
              >
                انصراف
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-lg bg-rose-600 px-5 py-2 text-xs text-white"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
