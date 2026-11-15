"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { toast } from "react-toastify";
import { Loader2, FileDown } from "lucide-react";
import { AttendancePdfDocument } from "@/lib/pdf/AttendancePdfDocument";

type AttendanceSheet = any; // یا type واقعی

type Props = {
  selections: Array<{ klassId: string; classCourseIds: string[] }>;
  splitLargeClasses?: boolean;
  count: number;
};

export default function AttendancePdfButton({
  selections,
  splitLargeClasses,
  count,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (selections.length === 0) {
      toast.error("حداقل یک درس انتخاب کنید");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/attendance-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selections, splitLargeClasses }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "خطا در دریافت داده");
        return;
      }

      const { data } = (await res.json()) as { data: AttendanceSheet[] };

      const blob = await pdf(
        <AttendancePdfDocument
          sheets={data}
          splitLargeClasses={splitLargeClasses}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance-${new Date().toISOString().slice(0, 10)}.pdf`;
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
      disabled={loading || count === 0}
      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          در حال ساخت PDF...
        </>
      ) : (
        <>
          <FileDown size={16} />
          دانلود PDF ({count} برگه) کاربرگ
        </>
      )}
    </button>
  );
}
