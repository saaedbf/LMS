"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { toast } from "react-toastify";
import { Loader2, BookOpen } from "lucide-react";
import { WeeklyAttendanceCoverPdf } from "@/lib/pdf/WeeklyAttendanceCoverPdf";

type CoverData = {
  schoolTitle: string;
  schoolSubTitle: string | null;
  schoolId: number;
  academicYearTitle: string;
  managerName: string | null;
  deputyName: string | null;
  address: string | null;
  phone: string | null;
  doreTitle: string | null;
  teachersCount: number;
};

export default function WeeklyCoverPdfButton() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // ۱. داده از API
      const res = await fetch("/api/weekly-cover-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "خطا در دریافت داده");
        return;
      }

      const { data } = (await res.json()) as { data: CoverData };

      // ۲. PDF در مرورگر
      const blob = await pdf(<WeeklyAttendanceCoverPdf data={data} />).toBlob();

      // ۳. دانلود
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `روکش-دفتر-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success("روکش آماده شد");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "خطا در ساخت روکش");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          در حال ساخت روکش...
        </>
      ) : (
        <>
          <BookOpen size={16} />
          روکش دفتر حضور و غیاب دبیران
        </>
      )}
    </button>
  );
}
