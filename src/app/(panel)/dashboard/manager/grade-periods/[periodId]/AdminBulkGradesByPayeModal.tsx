"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { ClipboardPaste, CheckCircle, Loader2 } from "lucide-react";
import ActionModal from "@/components/widgets/ActionModal";
import { bulkSaveGradesByPayeByAdmin } from "@/actions/adminGradeActions";

type Props = {
  periodId: string;
  payes: {
    payeId: number;
    payeTitle: string;
    lessons: { id: string; title: string }[];
  }[];
  gradingType: "NUMERIC" | "DESCRIPTIVE";
  onSuccess?: () => void;
};

export default function AdminBulkGradesByPayeModal({
  periodId,
  payes,
  gradingType,
  onSuccess,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectedPaye, setSelectedPaye] = useState<number>(0);
  const [selectedLesson, setSelectedLesson] = useState<string>("");
  const [text, setText] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setSelectedPaye(0);
      setSelectedLesson("");
      setText("");
      setResult(null);
    }, 300);
  };

  const handleProcess = async () => {
    if (!selectedPaye || !selectedLesson) {
      return toast.error("پایه و درس را انتخاب کنید");
    }
    if (!text.trim()) {
      return toast.error("متنی برای پردازش وجود ندارد");
    }

    const lines = text.trim().split("\n");
    const gradesData: any[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(/\t|,|\|/).map((p) => p.trim());

      let cleanCode = String(parts[0]).replace(/\D/g, "");
      if (cleanCode.length === 8) cleanCode = "00" + cleanCode;
      else if (cleanCode.length === 9) cleanCode = "0" + cleanCode;

      if (parts.length >= 2) {
        if (parts.length >= 4) {
          gradesData.push({
            nationalCode: cleanCode,
            correctCount: Number(parts[1]) || 0,
            wrongCount: Number(parts[2]) || 0,
            blankCount: Number(parts[3]) || 0,
          });
        } else {
          gradesData.push({ nationalCode: cleanCode, value: parts[1] });
        }
      }
    }

    setIsPending(true);
    setResult(null);

    try {
      const res = await bulkSaveGradesByPayeByAdmin({
        periodId,
        payeId: selectedPaye,
        darsPayeReshtehId: selectedLesson,
        grades: gradesData,
        gradingType,
      });

      if (res.status === "error") {
        toast.error(res.error);
      } else {
        setResult(res.data);
        toast.success("پردازش به پایان رسید");
        if (onSuccess) onSuccess();
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsPending(false);
    }
  };

  const selectedPayeData = payes.find((p) => p.payeId === selectedPaye);

  return (
    <ActionModal
      title="ثبت گروهی برای کل پایه"
      desc="پایه و درس را انتخاب کنید، سپس نمرات را از اکسل پیست کنید."
      open={open}
      setOpen={setOpen}
      trigger={
        <button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700">
          <ClipboardPaste size={16} />
          ثبت گروهی (کل پایه)
        </button>
      }
      contentClassName="w-[95vw] max-w-lg"
    >
      <div className="space-y-4 p-4">
        {!result && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">
                  پایه
                </label>
                <select
                  value={selectedPaye}
                  onChange={(e) => {
                    setSelectedPaye(Number(e.target.value));
                    setSelectedLesson("");
                  }}
                  className="w-full rounded-lg border border-zinc-300 p-2 text-sm"
                >
                  <option value={0}>-- انتخاب پایه --</option>
                  {payes.map((p) => (
                    <option key={p.payeId} value={p.payeId}>
                      {p.payeTitle}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">
                  درس
                </label>
                <select
                  value={selectedLesson}
                  onChange={(e) => setSelectedLesson(e.target.value)}
                  disabled={!selectedPaye}
                  className="w-full rounded-lg border border-zinc-300 p-2 text-sm"
                >
                  <option value="">-- انتخاب درس --</option>
                  {selectedPayeData?.lessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder="کد ملی \t نمره (یا ۳ ستون تستی)"
              className="w-full rounded-lg border border-zinc-300 p-3 font-mono text-sm"
              dir="ltr"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleProcess}
                disabled={
                  isPending || !selectedPaye || !selectedLesson || !text.trim()
                }
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2 text-sm text-white disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <CheckCircle size={16} />
                )}
                پردازش و ثبت
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
                className="rounded-lg bg-zinc-800 px-6 py-2 text-sm text-white"
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
