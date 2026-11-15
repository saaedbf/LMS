"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { toast } from "react-toastify";
import { Loader2, FileText } from "lucide-react";
// ⬇⬇ مسیر کامپوننت PDF فرم یادداشت را تطبیق دهید
import { TeacherNotesPdfDocument } from "@/lib/pdf/TeacherNotesPdfDocument";

type AttendanceSheet = any;

type Props = {
  selections: Array<{ klassId: string; classCourseIds: string[] }>;
  count: number;
};

export default function TeacherNotesPdfButton({ selections, count }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (selections.length === 0) {
      toast.error("حداقل یک درس انتخاب کنید");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/teacher-notes-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selections }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "خطا در دریافت داده");
        return;
      }

      const { data } = (await res.json()) as { data: AttendanceSheet[] };

      const blob = await pdf(
        <TeacherNotesPdfDocument sheets={data} />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `فرم-یادداشت-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success("فرم یادداشت آماده شد");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "خطا در ساخت فرم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading || count === 0}
      className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          در حال ساخت فرم...
        </>
      ) : (
        <>
          <FileText size={16} />
          فرم یاد داشت دبیر
        </>
      )}
    </button>
  );
}
