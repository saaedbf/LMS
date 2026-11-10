"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Upload, Loader2, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

import ActionModal from "@/components/widgets/ActionModal";
import {
  getPayesForExam,
  bulkSaveStudentAnswersByPaye,
} from "@/actions/gradePeriodActions";

type Paye = { payeId: number; payeTitle: string };
type Row = { nationalCode: string; answers: string };
type Result = { updated: number; skipped: number; errors: string[] };

type Props = {
  gradePeriodId: string;
  trigger?: React.ReactNode;
};

export default function BulkAnswersModal({ gradePeriodId, trigger }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [payes, setPayes] = useState<Paye[]>([]);
  const [selectedPayeId, setSelectedPayeId] = useState<number | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [fileName, setFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!open) return;
    getPayesForExam(gradePeriodId).then((res) => {
      if (res.status === "success") {
        setPayes(res.data);
        if (res.data.length > 0) setSelectedPayeId(res.data[0].payeId);
      } else toast.error(res.error);
    });
  }, [open, gradePeriodId]);

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setResult(null);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws, {
        defval: "",
      });

      const parsed: Row[] = [];
      for (const r of json) {
        const nc =
          r["کد ملی"] ??
          r["کدملی"] ??
          r["nationalCode"] ??
          r["NationalCode"] ??
          "";
        const ans = r["پاسخ"] ?? r["پاسخ‌ها"] ?? r["answers"] ?? "";
        const ncStr = String(nc).trim();
        const ansStr = String(ans).trim();
        if (!ncStr) continue;
        parsed.push({ nationalCode: ncStr, answers: ansStr });
      }

      if (parsed.length === 0) {
        toast.error(
          "هیچ ردیف معتبری پیدا نشد. ستون‌های «کد ملی» و «پاسخ» لازم است.",
        );
        return;
      }
      setRows(parsed);
    } catch (e: any) {
      toast.error("خطا در خواندن فایل: " + (e?.message ?? ""));
    }
  };

  const handleSave = async () => {
    if (selectedPayeId === null) {
      toast.error("پایه را انتخاب کنید");
      return;
    }
    if (rows.length === 0) {
      toast.error("فایلی بارگذاری نشده");
      return;
    }
    setSaving(true);
    const res = await bulkSaveStudentAnswersByPaye({
      gradePeriodId,
      payeId: selectedPayeId,
      rows,
    });
    setSaving(false);
    if (res.status === "error") {
      toast.error(res.error);
      return;
    }
    setResult(res.data);
    toast.success(`${res.data.updated} پاسخ ذخیره شد`);
    router.refresh();
  };

  return (
    <ActionModal
      title="ثبت گروهی پاسخ دانش‌آموزان"
      desc="فایل اکسل با ستون‌های «کد ملی» و «پاسخ» (فرمت <1;4><2;2>...)"
      open={open}
      setOpen={setOpen}
      contentClassName="w-[95vw] max-w-2xl"
      trigger={
        trigger ?? (
          <button
            type="button"
            title="ثبت گروهی پاسخ‌ها"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-sky-300 text-sky-700 transition-colors hover:bg-sky-50"
          >
            <Upload size={16} />
          </button>
        )
      }
    >
      <div className="space-y-4 p-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">
            پایه
          </label>
          <select
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={selectedPayeId ?? ""}
            onChange={(e) => {
              setSelectedPayeId(Number(e.target.value));
              // ⬅️ ریست فایل و نتیجه وقتی پایه عوض می‌شه
              setRows([]);
              setFileName("");
              setResult(null);
            }}
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
            فایل اکسل (xlsx / csv)
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-zinc-400 px-3 py-3 text-sm text-zinc-600 hover:bg-zinc-50">
            <FileSpreadsheet size={16} />
            <span>{fileName || "انتخاب فایل..."}</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>
          {rows.length > 0 && (
            <p className="mt-1 text-[11px] text-emerald-700">
              {rows.length} ردیف آماده ثبت است.
            </p>
          )}
        </div>

        {result && (
          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs">
            <div>
              ذخیره‌شده: <b className="text-emerald-700">{result.updated}</b> |
              رد‌شده: <b className="text-amber-700">{result.skipped}</b>
            </div>
            {result.errors.length > 0 && (
              <ul className="mt-2 max-h-40 space-y-0.5 overflow-y-auto pr-2 text-rose-600">
                {result.errors.map((e, i) => (
                  <li key={i}>• {e}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-zinc-200 pt-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
          >
            بستن
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || selectedPayeId === null || rows.length === 0}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            ثبت گروهی
          </button>
        </div>
      </div>
    </ActionModal>
  );
}
