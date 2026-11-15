"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { toast } from "react-toastify";
import { Loader2, FileSpreadsheet } from "lucide-react";
import { DetailedReportPdf } from "@/lib/pdf/DetailedReportPdf";

type Props = {
  periodId: string;
  klassId: string;
  disabled?: boolean;
};

export default function DetailedReportListPdfButton({
  periodId,
  klassId,
  disabled,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!periodId || !klassId) {
      toast.error("دوره و کلاس را انتخاب کنید");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: "detailed",
        periodId,
        klassId,
      });

      const res = await fetch(`/api/manager-report-data?${params.toString()}`);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "خطا در دریافت داده");
        return;
      }

      const { data } = (await res.json()) as { data: any };

      const blob = await pdf(<DetailedReportPdf data={data} />).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `detailed-${klassId}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success("گزارش دانلود شد");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "خطا در ساخت گزارش");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading || disabled}
      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <FileSpreadsheet size={16} />
      )}
      {loading ? "در حال ساخت..." : "گزارش تفضیلی"}
    </button>
  );
}
