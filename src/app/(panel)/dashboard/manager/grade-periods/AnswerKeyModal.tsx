"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";

import ActionModal from "@/components/widgets/ActionModal";
import {
  getPayesForExam,
  getExamKeyForPaye,
  saveExamKeyForPaye,
} from "@/actions/gradePeriodActions";

type Props = {
  gradePeriodId: string;
  trigger?: React.ReactNode;
};

type Paye = { payeId: number; payeTitle: string };

export default function AnswerKeyModal({ gradePeriodId, trigger }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [payes, setPayes] = useState<Paye[]>([]);
  const [selectedPayeId, setSelectedPayeId] = useState<number | null>(null);
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getPayesForExam(gradePeriodId)
      .then((res) => {
        if (res.status === "success") {
          setPayes(res.data);
          if (res.data.length > 0) setSelectedPayeId(res.data[0].payeId);
        } else toast.error(res.error);
      })
      .finally(() => setLoading(false));
  }, [open, gradePeriodId]);

  useEffect(() => {
    if (!open || selectedPayeId === null) {
      setRaw("");
      return;
    }
    getExamKeyForPaye(gradePeriodId, selectedPayeId).then((res) => {
      const ak = res.answerKey;
      if (ak) {
        const formatted = Object.entries(ak)
          .sort((a, b) => parseInt(a[0], 10) - parseInt(b[0], 10))
          .map(([q, a]) => `<${q};${a}>`)
          .join("");
        setRaw(formatted);
      } else {
        setRaw("");
      }
    });
  }, [open, gradePeriodId, selectedPayeId]);

  const handleSave = async () => {
    if (selectedPayeId === null) {
      toast.error("پایه را انتخاب کنید");
      return;
    }
    setSaving(true);
    const res = await saveExamKeyForPaye({
      gradePeriodId,
      payeId: selectedPayeId,
      keyString: raw,
    });
    setSaving(false);
    if (res.status === "error") {
      toast.error(res.error);
      return;
    }
    toast.success(
      `کلید برای ${res.data.count} درس/کلاس این پایه ذخیره شد (${res.data.questionCount} سوال)`,
    );
    router.refresh();
    setOpen(false);
  };

  return (
    <ActionModal
      title="ثبت کلید آزمون پایه"
      desc="کلید برای همه دروس تستی این پایه اعمال می‌شود"
      open={open}
      setOpen={setOpen}
      contentClassName="w-[95vw] max-w-2xl"
      trigger={
        trigger ?? (
          <button
            type="button"
            title="ثبت کلید آزمون"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-amber-300 text-amber-700 transition-colors hover:bg-amber-50"
          >
            <KeyRound size={16} />
          </button>
        )
      }
    >
      <div className="space-y-4 p-2">
        {loading ? (
          <div className="flex items-center gap-2 py-4 text-sm text-zinc-500">
            <Loader2 size={14} className="animate-spin" /> در حال بارگذاری...
          </div>
        ) : payes.length === 0 ? (
          <div className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
            در این دوره درسی برای هیچ پایه‌ای ثبت نشده است.
          </div>
        ) : (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                پایه
              </label>
              <select
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                value={selectedPayeId ?? ""}
                onChange={(e) => setSelectedPayeId(Number(e.target.value))}
              >
                {payes.map((p) => (
                  <option key={p.payeId} value={p.payeId}>
                    {p.payeTitle}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                کلید آزمون (فرمت:{" "}
                <code className="text-[10px]">&lt;1;4&gt;&lt;2;2&gt;...</code>)
              </label>
              <textarea
                dir="ltr"
                rows={8}
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                placeholder="<1;4><2;2><3;2>..."
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
              />
              <p className="mt-1 text-[11px] text-zinc-500">
                این کلید روی همه دروس تستی این پایه (در همه کلاس‌ها) اعمال
                می‌شود. نمرات دست‌نخورده می‌مانند.
              </p>
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 border-t border-zinc-200 pt-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || selectedPayeId === null || !raw.trim()}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            ذخیره کلید
          </button>
        </div>
      </div>
    </ActionModal>
  );
}
