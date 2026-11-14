"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { toast } from "react-toastify";
import { Loader2, FileDown } from "lucide-react";
import { WeeklyAttendancePdfDocument } from "@/lib/pdf/WeeklyAttendancePdfDocument";
import type { WeeklyAttendanceData } from "@/types/weeklyTeacherAttendanceTypes";

export default function WeeklyPdfButton() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // ۱. داده را از API بگیر
      const res = await fetch("/api/weekly-attendance-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "خطا در دریافت داده");
        return;
      }

      const { data } = (await res.json()) as { data: WeeklyAttendanceData };

      // ۲. PDF را در مرورگر بساز
      const blob = await pdf(
        <WeeklyAttendancePdfDocument data={data} />,
      ).toBlob();

      // ۳. دانلود
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `دفتر-حضور-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success("PDF آماده شد");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "خطا در ساخت PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          در حال ساخت PDF...
        </>
      ) : (
        <>
          <FileDown size={16} />
          دانلود دفتر حضور هفتگی
        </>
      )}
    </button>
  );
}
