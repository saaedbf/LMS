"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { toast } from "react-toastify";
import { Loader2, FileText } from "lucide-react";
import { DisciplinaryReportPdf } from "@/lib/pdf/DisciplinaryReportPdf";
import type { StudentDisciplinaryReport } from "@/actions/disciplinaryReportActions";

type Props = {
  enrollmentId: string;
};

export default function DisciplinaryReportPdfButton({ enrollmentId }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // ۱. داده از API
      const res = await fetch(`/api/disciplinary-report-data/${enrollmentId}`);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "خطا در دریافت داده");
        return;
      }

      const { data } = (await res.json()) as {
        data: StudentDisciplinaryReport;
      };

      // ⬇⬇ چک داده
      if (!data) {
        toast.error("داده‌ای برای کارنامه یافت نشد");
        return;
      }

      // ۲. PDF در مرورگر
      const blob = await pdf(<DisciplinaryReportPdf data={data} />).toBlob();

      // ۳. دانلود
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `کارنامه-انضباطی-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success("کارنامه انضباطی آماده شد");
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
      title="دانلود کارنامه انضباطی"
      className="inline-flex h-9 items-center justify-center rounded-md border border-emerald-300 px-2 text-xs text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <>
          <FileText size={16} className="ml-1" />
          کارنامه انضباطی
        </>
      )}
    </button>
  );
}
