"use client";

import { useState, useTransition } from "react";
import { updateAbsenceAction } from "@/actions/absenceActions";
import { AbsenceType } from "@prisma/client";
import { toast } from "react-toastify";

interface Props {
  absence: {
    id: string;
    absenceType: AbsenceType;
    reason: string | null;
    studentName: string;
    date: string | Date;
  };
  setOpen: (open: boolean) => void;
}

export default function AbsenceEditForm({ absence, setOpen }: Props) {
  const [absenceType, setAbsenceType] = useState<AbsenceType>(
    absence.absenceType,
  );
  const [reason, setReason] = useState<string>(absence.reason || "");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const res = await updateAbsenceAction({
        id: absence.id,
        absenceType,
        reason: reason.trim() || undefined,
      });

      if (res.status === "error") {
        toast.error(res.error.toString() || "خطا در ویرایش وضعیت غیبت");
      } else {
        toast.success("وضعیت غیبت با موفقیت به‌روزرسانی شد");
        setOpen(false);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 text-sm">
      <div className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
        <div>
          دانش‌آموز:{" "}
          <strong className="text-zinc-900 dark:text-white">
            {absence.studentName}
          </strong>
        </div>
        <div className="mt-1">
          تاریخ غیبت:{" "}
          <span dir="ltr">
            {new Date(absence.date).toLocaleDateString("fa-IR")}
          </span>
        </div>
      </div>

      <div>
        <label className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
          نوع وضعیت غیبت
        </label>
        <select
          value={absenceType}
          onChange={(e) => setAbsenceType(e.target.value as AbsenceType)}
          className="w-full rounded-lg border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        >
          <option value="UNKNOWN">نامشخص (نیاز به تعیین تکلیف)</option>
          <option value="EXCUSED">موجه</option>
          <option value="UNEXCUSED">غیرموجه</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
          توضیحات / دلیل غیبت
        </label>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="علت غیبت، ارائه گواهی پزشکی، تماس اولیا و ..."
          className="w-full rounded-lg border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        />
      </div>

      <div className="flex justify-end gap-2 pt-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
