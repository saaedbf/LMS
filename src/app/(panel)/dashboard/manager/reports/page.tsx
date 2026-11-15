"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import TitlePage from "@/components/widgets/TitlePage";
import BackButton from "@/components/widgets/Elements/BackButton";
import { getReportFilterData } from "@/actions/reportActions";
import dynamic from "next/dynamic";
export default function ReportsPage() {
  const [loadingData, setLoadingData] = useState(true);
  const [periods, setPeriods] = useState<any[]>([]);
  const [payes, setPayes] = useState<any[]>([]);

  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedPaye, setSelectedPaye] = useState<number>(0);
  const [selectedKlass, setSelectedKlass] = useState("");
  // ⬅️ حالت نمایش پاسخ‌نامه (برای دوره‌های تستی)
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);

  const [downloadingAcademic, setDownloadingAcademic] = useState(false);
  const [downloadingDetailed, setDownloadingDetailed] = useState(false);

  const AcademicReportListPdfButton = dynamic(
    () => import("@/components/AcademicReportListPdfButton"),
    { ssr: false, loading: () => <span className="text-xs">...</span> },
  );
  const DetailedReportListPdfButton = dynamic(
    () => import("@/components/DetailedReportListPdfButton"),
    { ssr: false, loading: () => <span className="text-xs">...</span> },
  );
  useEffect(() => {
    async function load() {
      const res = await getReportFilterData();
      if (res.status === "success") {
        setPeriods(res.data.periods);
        setPayes(res.data.payes);
      } else {
        toast.error(res.error);
      }
      setLoadingData(false);
    }
    load();
  }, []);

  // ⬅️ بررسی تستی بودن دوره انتخاب‌شده
  const selectedPeriodData = periods.find((p) => p.id === selectedPeriod);
  const isTestPeriod = selectedPeriodData?.examType === "TEST";

  const handleDownload = async (type: "academic" | "detailed") => {
    if (!selectedPeriod || !selectedKlass) {
      return toast.error("دوره و کلاس را انتخاب کنید");
    }

    const setDownloading =
      type === "academic" ? setDownloadingAcademic : setDownloadingDetailed;
    setDownloading(true);

    try {
      // ⬅️ پاس دادن includeAnswerKey فقط برای دوره تستی
      const params = new URLSearchParams({
        type,
        periodId: selectedPeriod,
        klassId: selectedKlass,
      });
      if (isTestPeriod) {
        params.set("includeAnswerKey", includeAnswerKey ? "true" : "false");
      }

      const res = await fetch(`/api/manager-report-pdf?${params.toString()}`);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "خطا در ساخت گزارش");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-${selectedKlass}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("گزارش دانلود شد");
    } catch (error) {
      toast.error("خطا در دریافت گزارش");
    } finally {
      setDownloading(false);
    }
  };

  const selectedPayeData = payes.find((p) => p.payeId === selectedPaye);

  if (loadingData) {
    return (
      <div className="p-8 text-center text-zinc-500">در حال بارگذاری...</div>
    );
  }

  return (
    <div className="p-2">
      <TitlePage>گزارش ریزنمرات</TitlePage>
      <BackButton
        href="/dashboard/manager"
        label="بازگشت به پنل مدیریت"
        className="mb-3"
      />

      <div className="container mx-auto max-w-2xl space-y-4 px-4 py-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
          {/* انتخاب دوره */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              دوره ثبت نمره:
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => {
                setSelectedPeriod(e.target.value);
                // ⬅️ با تغییر دوره، حالت پاسخ‌نامه رو ریست کن
                setIncludeAnswerKey(true);
              }}
              className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm"
            >
              <option value="">-- انتخاب دوره --</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                  {p.examType === "TEST" ? " (تستی)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* انتخاب پایه */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              پایه:
            </label>
            <select
              value={selectedPaye}
              onChange={(e) => {
                setSelectedPaye(Number(e.target.value));
                setSelectedKlass("");
              }}
              className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm"
            >
              <option value={0}>-- انتخاب پایه --</option>
              {payes.map((p) => (
                <option key={p.payeId} value={p.payeId}>
                  {p.payeTitle}
                </option>
              ))}
            </select>
          </div>

          {/* انتخاب کلاس */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              کلاس:
            </label>
            <select
              value={selectedKlass}
              onChange={(e) => setSelectedKlass(e.target.value)}
              disabled={!selectedPaye}
              className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm"
            >
              <option value="">-- انتخاب کلاس --</option>
              {selectedPayeData?.klasses.map((k: any) => (
                <option key={k.id} value={k.id}>
                  {k.title}
                </option>
              ))}
            </select>
          </div>

          {/* ⬅️ نمایش فقط برای دوره‌های تستی */}
          {isTestPeriod && (
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                نمایش پاسخ‌نامه:
              </label>
              <select
                value={includeAnswerKey ? "true" : "false"}
                onChange={(e) => setIncludeAnswerKey(e.target.value === "true")}
                className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm"
              >
                <option value="true">با پاسخ‌نامه</option>
                <option value="false">بدون پاسخ‌نامه</option>
              </select>
            </div>
          )}

          {/* دکمه‌ها */}

          <div className="flex flex-col gap-3 border-t border-zinc-100 pt-4 sm:flex-row">
            <AcademicReportListPdfButton
              periodId={selectedPeriod}
              klassId={selectedKlass}
              includeAnswerKey={isTestPeriod ? includeAnswerKey : undefined}
              disabled={!selectedPeriod || !selectedKlass}
            />
            <DetailedReportListPdfButton
              periodId={selectedPeriod}
              klassId={selectedKlass}
              disabled={!selectedPeriod || !selectedKlass}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
