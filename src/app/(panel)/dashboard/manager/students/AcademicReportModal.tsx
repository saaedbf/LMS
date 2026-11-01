"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import ActionModal from "@/components/widgets/ActionModal";
import { getPeriodsForReport } from "@/actions/academicReportActions";

export default function AcademicReportModal({
  enrollmentId,
}: {
  enrollmentId: string;
}) {
  const [open, setOpen] = useState(false);
  const [periods, setPeriods] = useState<{ id: string; title: string }[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (open && periods.length === 0) {
      setLoading(true);
      getPeriodsForReport().then((data) => {
        setPeriods(data);
        setLoading(false);
      });
    }
  }, [open]);

  const handleDownload = async () => {
    if (!selectedPeriod) return;
    setDownloading(true);
    try {
      const res = await fetch(
        `/api/academic-report/${enrollmentId}?periodId=${selectedPeriod}`,
      );
      if (!res.ok) throw new Error("خطا در دریافت فایل");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `کارنامه-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("خطا در دریافت کارنامه");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ActionModal
      title="کارنامه تحصیلی"
      desc="دوره مورد نظر را انتخاب کنید"
      open={open}
      setOpen={setOpen}
      trigger={
        <button className="inline-flex h-9 items-center justify-center rounded-md border border-blue-300 px-2 text-xs text-blue-700 transition hover:bg-blue-50">
          <FileText size={16} className="ml-1" />
          کارنامه
        </button>
      }
      contentClassName="w-[95vw] max-w-md"
    >
      <div className="space-y-4 p-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                دوره ثبت نمره:
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 p-2 text-sm"
              >
                <option value="">-- انتخاب دوره --</option>
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                انصراف
              </button>
              <button
                onClick={handleDownload}
                disabled={!selectedPeriod || downloading}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm text-white disabled:opacity-50"
              >
                {downloading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Download size={16} />
                )}
                مشاهده کارنامه
              </button>
            </div>
          </>
        )}
      </div>
    </ActionModal>
  );
}
