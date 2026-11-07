"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { CheckCircle, Loader2, Percent } from "lucide-react";
import ActionModal from "@/components/widgets/ActionModal";
import { bulkSaveSameGradeByAdmin } from "@/actions/adminGradeActions";

type Props = {
  periodId: string;
  lessonId: string;
  klassId: string;
  gradingType: "NUMERIC" | "DESCRIPTIVE";
  onSuccess?: () => void;
};

const DESCRIPTIVE_OPTIONS = ["خیلی خوب", "خوب", "قابل قبول", "نیاز به تلاش"];

export default function BulkSameGradeModal({
  periodId,
  lessonId,
  klassId,
  gradingType,
  onSuccess,
}: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>("");
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<{
    created: number;
    updated: number;
  } | null>(null);

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setValue("");
      setResult(null);
    }, 300);
  };

  const handleSubmit = async () => {
    if (value === "") {
      return toast.error("لطفاً نمره را وارد کنید");
    }

    setIsPending(true);
    setResult(null);

    try {
      const res = await bulkSaveSameGradeByAdmin({
        periodId,
        lessonId,
        klassId,
        value,
        gradingType,
      });

      if (res.status === "error") {
        toast.error(res.error);
      } else {
        setResult(res.data);
        toast.success("نمره برای همه دانش‌آموزان ثبت شد");
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <ActionModal
      title="ثبت یک نمره برای همه"
      desc="این نمره برای تمام دانش‌آموزان این کلاس ثبت یا به‌روزرسانی می‌شود."
      open={open}
      setOpen={(isOpen) => {
        if (!isOpen) handleClose();
        else setOpen(true);
      }}
      trigger={
        <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700">
          <Percent size={16} />
          ثبت نمره یکسان
        </button>
      }
      contentClassName="w-[95vw] max-w-sm"
    >
      <div className="space-y-4 p-4">
        {!result && (
          <>
            <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
              با این کار، نمره فعلی همه دانش‌آموزان در این درس بازنویسی می‌شود.
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                نمره مورد نظر:
              </label>
              {gradingType === "NUMERIC" ? (
                <input
                  type="number"
                  min={0}
                  max={20}
                  step={0.25}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="مثلاً 20"
                  autoFocus
                />
              ) : (
                <select
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- انتخاب کنید --</option>
                  {DESCRIPTIVE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
                disabled={isPending}
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending || value === ""}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2 text-sm text-white disabled:opacity-50 hover:bg-emerald-700"
              >
                {isPending ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <CheckCircle size={16} />
                )}
                {isPending ? "در حال ثبت..." : "ثبت برای همه"}
              </button>
            </div>
          </>
        )}

        {result && (
          <div className="space-y-4 text-center">
            <div className="rounded-full bg-emerald-100 p-3 text-emerald-600 inline-block mx-auto">
              <CheckCircle size={32} />
            </div>
            <h3 className="font-bold text-zinc-800">با موفقیت انجام شد</h3>
            <div className="flex justify-center gap-4 text-sm">
              <span className="text-emerald-600">
                {result.created} نمره جدید
              </span>
              <span className="text-blue-600">
                {result.updated} به‌روزرسانی
              </span>
            </div>
            <button
              onClick={handleClose}
              className="mt-2 w-full rounded-lg bg-zinc-800 py-2 text-sm text-white hover:bg-zinc-900"
            >
              بستن
            </button>
          </div>
        )}
      </div>
    </ActionModal>
  );
}
