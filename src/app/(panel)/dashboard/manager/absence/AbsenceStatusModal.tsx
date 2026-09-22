"use client";

import { useState, useTransition } from "react";
import { updateAbsenceAction, AbsenceListItem } from "@/actions/absenceActions";

interface Props {
  absence: AbsenceListItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AbsenceStatusModal({
  absence,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [absenceType, setAbsenceType] = useState<
    "UNKNOWN" | "EXCUSED" | "UNEXCUSED"
  >(absence.absenceType);
  const [reason, setReason] = useState<string>(absence.reason || "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await updateAbsenceAction({
        id: absence.id,
        absenceType,
        reason: reason.trim() || null,
      });

      if (res.status === "error") {
        setError(res.error.toString() || "خطا در ویرایش وضعیت");
      } else {
        onSuccess?.();
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h3 className="mb-4 text-lg font-bold text-zinc-850 dark:text-white">
          تعیین وضعیت غیبت: {absence.studentEnrollment.student.firstName}{" "}
          {absence.studentEnrollment.student.lastName}
        </h3>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              نوع غیبت
            </label>
            <select
              value={absenceType}
              onChange={(e) => setAbsenceType(e.target.value as any)}
              className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            >
              <option value="UNKNOWN">نامشخص</option>
              <option value="EXCUSED">موجه</option>
              <option value="UNEXCUSED">غیرموجه</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              علت / توضیحات
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="در صورت وجود، علت غیبت را وارد کنید..."
              className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? "در حال ثبت..." : "ذخیره تغییرات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
