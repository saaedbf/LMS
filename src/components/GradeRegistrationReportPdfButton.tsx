"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { toast } from "react-toastify";
import { Loader2, FileSpreadsheet } from "lucide-react";
import { GradeRegistrationReportPdf } from "@/lib/pdf/GradeRegistrationReportPdf";

type Props = {
  gradePeriodId: string;
};

export default function GradeRegistrationReportPdfButton({
  gradePeriodId,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/grade-registration-report-data/${gradePeriodId}`,
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "خطا در دریافت داده");
        return;
      }

      const { data, meta } = (await res.json()) as {
        data: any[];
        meta: {
          periodTitle: string;
          schoolTitle: string;
          academicYearTitle: string;
        };
      };

      const blob = await pdf(
        <GradeRegistrationReportPdf
          rows={data}
          periodTitle={meta.periodTitle}
          schoolTitle={meta.schoolTitle}
          academicYearTitle={meta.academicYearTitle}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `grade-report-${Date.now()}.pdf`;
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
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <FileSpreadsheet size={14} />
      )}
      {loading ? "در حال ساخت..." : "گزارش ثبت نمرات"}
    </button>
  );
}
