"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";

import { getGradeRegistrationReport } from "@/actions/gradePeriodReportActions";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { GradeRegistrationReportPdf } from "@/lib/pdf/GradeRegistrationReportPdf";

function pct(a: number, b: number) {
  if (b <= 0) return 0;
  return Math.round((a / b) * 100);
}

export default function ReportButtons({
  gradePeriodId,
}: {
  gradePeriodId: string;
}) {
  const [loading, setLoading] = useState<"excel" | "pdf" | null>(null);

  const handleExcel = async () => {
    setLoading("excel");
    try {
      const res = await getGradeRegistrationReport(gradePeriodId);
      if (res.status === "error") {
        toast.error(res.error);
        return;
      }
      if (!res.data || res.data.length === 0) {
        toast.info("داده‌ای برای خروجی وجود ندارد");
        return;
      }

      exportToExcel({
        data: res.data,
        fileName: `grade-report-${new Date().toISOString().split("T")[0]}.xlsx`,
        sheetName: "گزارش ثبت نمرات",
        columns: [
          { key: "teacherName", title: "نام معلم", width: 30 },
          { key: "totalAssignments", title: "دروس تخصیص‌یافته", width: 18 },
          { key: "submittedCount", title: "دروس ثبت‌شده", width: 16 },
          { key: "pendingCount", title: "دروس ثبت‌نشده", width: 16 },
          { key: "totalGrades", title: "کل نمرات ثبت‌شده", width: 18 },
          { key: "expectedGrades", title: "نمرات مورد انتظار", width: 18 },
          {
            key: "studentsMissingGrades",
            title: "نمرات مانده (دانش‌آموز)",
            width: 22,
          },
          {
            key: "progressLessons",
            title: "درصد پیشرفت دروس",
            width: 16,
            render: (r) => `${pct(r.submittedCount, r.totalAssignments)}%`,
          },
          {
            key: "progressGrades",
            title: "درصد پیشرفت نمرات",
            width: 16,
            render: (r) => `${pct(r.totalGrades, r.expectedGrades)}%`,
          },
        ],
      });

      toast.success("فایل اکسل دانلود شد");
    } catch (e) {
      console.error(e);
      toast.error("خطا در تولید اکسل");
    } finally {
      setLoading(null);
    }
  };

  const handlePdf = async () => {
    setLoading("pdf");
    try {
      // ۱. داده از API
      const res = await fetch(
        `/api/grade-registration-report-data/${gradePeriodId}`,
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error ?? "خطا در دریافت داده");
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

      // ۲. PDF در مرورگر
      const blob = await pdf(
        <GradeRegistrationReportPdf
          rows={data}
          periodTitle={meta.periodTitle}
          schoolTitle={meta.schoolTitle}
          academicYearTitle={meta.academicYearTitle}
        />,
      ).toBlob();

      // ۳. دانلود
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `grade-report-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success("فایل PDF دانلود شد");
    } catch (e) {
      console.error(e);
      toast.error("خطا در تولید PDF");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleExcel}
        disabled={loading !== null}
        className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-950/40 dark:text-emerald-300"
      >
        {loading === "excel" ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <FileSpreadsheet size={14} />
        )}
        گزارش اکسل
      </button>

      <button
        type="button"
        onClick={handlePdf}
        disabled={loading !== null}
        className="inline-flex items-center gap-1.5 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-50 dark:bg-rose-950/40 dark:text-rose-300"
      >
        {loading === "pdf" ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <FileText size={14} />
        )}
        گزارش PDF
      </button>
    </div>
  );
}
