"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { toast } from "react-toastify";
import { Loader2, BookOpen } from "lucide-react";
import { TeacherCoverPdfDocument } from "@/lib/pdf/TeacherCoverPdfDocument";
import type { TeacherCoverSheet } from "@/actions/attendanceActions";

export default function TeacherCoverPdfButton() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher-cover-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "خطا در دریافت داده");
        return;
      }

      const { data } = (await res.json()) as { data: TeacherCoverSheet[] };

      // ⬇⬇ نام پراپ درست: teachers (نه TeacherCoverSheet)
      const blob = await pdf(
        <TeacherCoverPdfDocument teachers={data} />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `روکش-دبیران-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success("روکش دبیران آماده شد");
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
      className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          در حال ساخت روکش...
        </>
      ) : (
        <>
          <BookOpen size={16} />
          دانلود روکش کاربرگ دبیران
        </>
      )}
    </button>
  );
}
