"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import TitlePage from "@/components/widgets/TitlePage";
import BackButton from "@/components/widgets/Elements/BackButton";
import { getReportFilterData } from "@/actions/reportActions";

export default function ReportsPage() {
  const [loadingData, setLoadingData] = useState(true);
  const [periods, setPeriods] = useState<any[]>([]);
  const [payes, setPayes] = useState<any[]>([]);

  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedPaye, setSelectedPaye] = useState<number>(0);
  const [selectedKlass, setSelectedKlass] = useState("");

  const [downloadingAcademic, setDownloadingAcademic] = useState(false);
  const [downloadingDetailed, setDownloadingDetailed] = useState(false);

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

  const handleDownload = async (type: "academic" | "detailed") => {
    if (!selectedPeriod || !selectedKlass) {
      return toast.error("دوره و کلاس را انتخاب کنید");
    }

    const setDownloading =
      type === "academic" ? setDownloadingAcademic : setDownloadingDetailed;
    setDownloading(true);

    try {
      const res = await fetch(
        `/api/manager-report-pdf?type=${type}&periodId=${selectedPeriod}&klassId=${selectedKlass}`,
      );

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
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm"
            >
              <option value="">-- انتخاب دوره --</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
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

          {/* دکمه‌ها */}
          <div className="flex flex-col gap-3 border-t border-zinc-100 pt-4 sm:flex-row">
            <button
              onClick={() => handleDownload("academic")}
              disabled={
                downloadingAcademic || !selectedPeriod || !selectedKlass
              }
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {downloadingAcademic ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <FileText size={16} />
              )}
              {downloadingAcademic ? "در حال ساخت..." : "کارنامه"}
            </button>
            <button
              onClick={() => handleDownload("detailed")}
              disabled={
                downloadingDetailed || !selectedPeriod || !selectedKlass
              }
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {downloadingDetailed ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <FileSpreadsheet size={16} />
              )}
              {downloadingDetailed ? "در حال ساخت..." : "گزارش تفضیلی"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
