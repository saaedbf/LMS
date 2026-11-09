"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { ClipboardPaste, CheckCircle, Loader2 } from "lucide-react";
import ActionModal from "@/components/widgets/ActionModal";
import { bulkSaveGradesByAdmin } from "@/actions/adminGradeActions";

type Props = {
  periodId: string;
  lessonId: string;
  klassId: string;
  gradingType: "NUMERIC" | "DESCRIPTIVE";
  isTest?: boolean; // ⬅️ اضافه شد
  questionCount?: number; // ⬅️ اضافه شد
  onSuccess?: () => void;
};

export default function AdminBulkGradesModal({
  periodId,
  lessonId,
  klassId,
  gradingType,
  isTest = false,
  questionCount = 0,
  onSuccess,
}: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (open) {
      setText("");
      setResult(null);
      setIsPending(false);
    }
  }, [open]);

  const handleClose = () => setOpen(false);

  const handleProcess = async () => {
    if (!text.trim()) return toast.error("متنی برای پردازش وجود ندارد");

    const lines = text.trim().split("\n");
    // ⬅️ تایپ داده‌های ارسالی
    const gradesData: {
      nationalCode: string;
      value?: string;
      correctCount?: number;
      wrongCount?: number;
      blankCount?: number;
    }[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(/\t|,|\|/).map((p) => p.trim());

      let cleanCode = String(parts[0]).replace(/\D/g, "");
      if (cleanCode.length === 8) cleanCode = "00" + cleanCode;
      else if (cleanCode.length === 9) cleanCode = "0" + cleanCode;

      if (isTest) {
        // ⬅️ حالت تستی: کد ملی، صحیح، غلط، بی‌پاسخ
        if (parts.length >= 4) {
          gradesData.push({
            nationalCode: cleanCode,
            correctCount: Number(parts[1]) || 0,
            wrongCount: Number(parts[2]) || 0,
            blankCount: Number(parts[3]) || 0,
          });
        }
      } else {
        // حالت عادی: کد ملی، نمره
        if (parts.length >= 2) {
          gradesData.push({
            nationalCode: cleanCode,
            value: parts[1],
          });
        }
      }
    }

    if (gradesData.length === 0) {
      return toast.error("هیچ ردیف معتبری یافت نشد. فرمت را بررسی کنید.");
    }

    setIsPending(true);
    setResult(null);

    try {
      // ⬅️ در اینجا باید اکشن ثبت گروهی را طوری تغییر دهید که فیلدهای تستی را هم بگیرد
      const res = await bulkSaveGradesByAdmin({
        periodId,
        lessonId,
        klassId,
        grades: gradesData,
        gradingType,
        isTest,
        questionCount,
      });

      if (res.status === "error") {
        toast.error(res.error);
      } else {
        setResult(res.data);
        toast.success("پردازش به پایان رسید");
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
      title={`ثبت گروهی نمرات ${isTest ? "(تستی)" : ""}`}
      desc="کد ملی و نمره(ها) را از اکسل کپی کرده و در کادر زیر پیست کنید."
      open={open}
      setOpen={setOpen}
      trigger={
        <button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700">
          <ClipboardPaste size={16} />
          ثبت گروهی
        </button>
      }
      contentClassName="w-[95vw] max-w-lg"
    >
      <div className="space-y-4 p-4">
        {!result && (
          <>
            <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
              <p className="font-bold mb-1">راهنما:</p>
              {isTest ? (
                <>
                  <p>ستون اول: کد ملی</p>
                  <p>ستون دوم: تعداد صحیح</p>
                  <p>ستون سوم: تعداد غلط</p>
                  <p>ستون چهارم: تعداد بی‌پاسخ</p>
                  <p className="mt-1 font-bold text-indigo-700">
                    (تعداد کل سوالات این درس: {questionCount})
                  </p>
                </>
              ) : (
                <>
                  <p>ستون اول: کد ملی (۸ تا ۱۱ رقم)</p>
                  <p>
                    ستون دوم: نمره{" "}
                    {gradingType === "NUMERIC"
                      ? "(عددی از 0 تا 20)"
                      : "(خیلی خوب، خوب، قابل قبول، نیاز به تلاش)"}
                  </p>
                </>
              )}
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder={
                isTest
                  ? `0012345678\t18\t2\t0\n0098765432\t15\t5\t0\n...`
                  : `0012345678\t18.5\n0098765432\t15\n...`
              }
              className="w-full rounded-lg border border-zinc-300 p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              dir="ltr"
            />

            <div className="flex justify-end gap-2">
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
                onClick={handleProcess}
                disabled={isPending || !text.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2 text-sm text-white disabled:opacity-50 hover:bg-indigo-700"
              >
                {isPending ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <CheckCircle size={16} />
                )}
                {isPending ? "در حال ثبت..." : "پردازش و ثبت"}
              </button>
            </div>
          </>
        )}

        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-emerald-50 p-3">
                <div className="text-xl font-bold text-emerald-600">
                  {result.created}
                </div>
                <div className="text-xs text-emerald-700">جدید</div>
              </div>
              <div className="rounded-lg bg-blue-50 p-3">
                <div className="text-xl font-bold text-blue-600">
                  {result.updated}
                </div>
                <div className="text-xs text-blue-700">به‌روزرسانی</div>
              </div>
              <div className="rounded-lg bg-rose-50 p-3">
                <div className="text-xl font-bold text-rose-600">
                  {result.skipped}
                </div>
                <div className="text-xs text-rose-700">رد شد</div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="max-h-40 overflow-y-auto rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <p className="font-bold mb-1">خطاها:</p>
                <ul className="list-inside list-disc space-y-1">
                  {result.errors.map((err: string, i: number) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg bg-zinc-800 px-6 py-2 text-sm text-white hover:bg-zinc-900"
              >
                بستن
              </button>
            </div>
          </div>
        )}
      </div>
    </ActionModal>
  );
}
