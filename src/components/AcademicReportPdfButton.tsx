"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { toast } from "react-toastify";
import { Loader2, FileText } from "lucide-react";
import { AcademicReportPdf } from "@/lib/pdf/AcademicReportPdf";
import type { AcademicReportData } from "@/actions/academicReportActions";

type Props = {
  enrollmentId: string;
};

export default function AcademicReportPdfButton({ enrollmentId }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/academic-report-data/${enrollmentId}`);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "خطا در دریافت داده");
        return;
      }

      const { data } = (await res.json()) as { data: AcademicReportData };

      const blob = await pdf(<AcademicReportPdf data={data} />).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `کارنامه-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success("کارنامه آماده شد");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "خطا در ساخت کارنامه");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      title="دانلود کارنامه تحصیلی"
      className="inline-flex h-9 items-center justify-center rounded-md border border-blue-300 px-2 text-xs text-blue-700 transition hover:bg-blue-50 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <>
          <FileText size={16} className="ml-1" />
          کارنامه
        </>
      )}
    </button>
  );
}
