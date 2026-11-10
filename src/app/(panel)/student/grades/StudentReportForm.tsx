"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { getStudentReport } from "@/actions/studentReportActions";
import { Loader2, Award, BookOpen, TrendingUp, Download } from "lucide-react";
import type { AcademicReportData } from "@/actions/academicReportActions";

export default function StudentReportForm({
  periods,
  enrollmentId,
}: {
  periods: { id: string; title: string }[];
  enrollmentId: string;
}) {
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [reportData, setReportData] = useState<AcademicReportData | null>(null);

  const handleFetchReport = async () => {
    if (!selectedPeriod) return toast.error("لطفاً یک دوره را انتخاب کنید");

    setLoading(true);
    const res = await getStudentReport(enrollmentId, selectedPeriod);
    setLoading(false);

    if (res.status === "error") {
      toast.error(res.error);
    } else {
      setReportData(res.data);
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedPeriod) return;
    setDownloading(true);
    try {
      const res = await fetch(
        `/api/academic-report/${enrollmentId}?periodId=${selectedPeriod}`,
      );
      if (!res.ok) throw new Error("خطا در دریافت فایل");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `کارنامه-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("کارنامه دانلود شد");
    } catch (error) {
      console.error(error);
      toast.error("خطا در دانلود کارنامه");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* انتخاب دوره */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-zinc-700">
          انتخاب دوره ثبت نمره:
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={selectedPeriod}
            onChange={(e) => {
              setSelectedPeriod(e.target.value);
              setReportData(null);
            }}
            className="flex-1 rounded-lg border border-zinc-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">-- انتخاب کنید --</option>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <button
            onClick={handleFetchReport}
            disabled={loading || !selectedPeriod}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <BookOpen size={16} />
            )}
            مشاهده کارنامه
          </button>
        </div>
      </div>

      {/* نمایش کارنامه */}
      {reportData && (
        <div className="space-y-6">
          {/* هدر کارنامه با دکمه دانلود */}
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-bold text-zinc-800">
              کارنامه: {periods.find((p) => p.id === selectedPeriod)?.title}
            </h2>
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 sm:w-auto"
            >
              {downloading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Download size={16} />
              )}
              دانلود PDF کارنامه
            </button>
          </div>

          {/* کارت‌های آمار */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
              <div className="mb-1 text-xs text-zinc-500">معدل کل</div>
              <div className="text-xl font-bold text-emerald-600">
                {reportData.studentAverage.toFixed(2)}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
              <div className="mb-1 text-xs text-zinc-500">رتبه در کلاس</div>
              <div className="text-xl font-bold text-blue-600">
                {reportData.classRank}{" "}
                <span className="text-xs font-normal text-zinc-400">
                  از {reportData.classSize}
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
              <div className="mb-1 text-xs text-zinc-500">رتبه در پایه</div>
              <div className="text-xl font-bold text-indigo-600">
                {reportData.gradeRank}{" "}
                <span className="text-xs font-normal text-zinc-400">
                  از {reportData.gradeSize}
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
              <div className="mb-1 text-xs text-zinc-500">تعداد دروس</div>
              <div className="text-xl font-bold text-zinc-800">
                {reportData.lessons.length}
              </div>
            </div>
          </div>

          {/* جدول دروس */}
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 bg-zinc-50 p-4">
              <h2 className="text-sm font-bold text-zinc-800">نمرات دروس</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-zinc-50 text-xs text-zinc-500">
                  <tr>
                    <th className="p-2 md:p-3">نام درس</th>

                    {/* ⬅️ ستون واحد فقط در دسکتاپ نمایش داده می‌شود */}
                    <th className="hidden p-2 md:table-cell md:p-3">واحد</th>

                    {/* ⬅️ ستون دبیر فقط در دسکتاپ نمایش داده می‌شود */}
                    <th className="hidden p-2 md:table-cell md:p-3">دبیر</th>

                    {reportData.period.examType === "TEST" && (
                      <>
                        <th className="p-2 md:p-3">سوال</th>
                        <th className="p-2 md:p-3">صحیح</th>
                        <th className="p-2 md:p-3">غلط</th>
                        <th className="p-2 md:p-3">بی‌پاسخ</th>
                        <th className="p-2 md:p-3">درصد</th>
                      </>
                    )}
                    <th className="p-2 md:p-3">نمره</th>
                    <th className="p-2 md:p-3">رتبه کلاس</th>
                    <th className="p-2 md:p-3">رتبه پایه</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {reportData.lessons.map((l, i) => (
                    <tr key={i} className="transition-colors hover:bg-zinc-50">
                      <td className="p-2 font-medium text-zinc-800 md:p-3">
                        {l.lessonTitle}
                      </td>

                      {/* ⬅️ ستون واحد فقط در دسکتاپ */}
                      <td className="hidden p-2 text-zinc-600 md:table-cell md:p-3">
                        {l.units}
                      </td>

                      {/* ⬅️ ستون دبیر فقط در دسکتاپ */}
                      <td className="hidden p-2 text-zinc-500 md:table-cell md:p-3">
                        {l.teacherName}
                      </td>

                      {reportData.period.examType === "TEST" && (
                        <>
                          <td className="p-2 text-zinc-600 md:p-3">
                            {l.questionCount ?? "-"}
                          </td>
                          <td className="p-2 text-emerald-600 md:p-3">
                            {l.correctCount ?? "-"}
                          </td>
                          <td className="p-2 text-rose-600 md:p-3">
                            {l.wrongCount ?? "-"}
                          </td>
                          <td className="p-2 text-zinc-500 md:p-3">
                            {l.blankCount ?? "-"}
                          </td>
                          <td className="p-2 font-bold text-blue-600 md:p-3">
                            {l.percentage !== null
                              ? `${l.percentage.toFixed(1)}%`
                              : "-"}
                          </td>
                        </>
                      )}

                      <td className="p-2 md:p-3">
                        <span
                          className={`font-bold ${
                            l.score && l.score >= 10
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        >
                          {l.score ?? l.descriptiveValue ?? "-"}
                        </span>
                      </td>
                      <td className="p-2 text-zinc-600 md:p-3">
                        {l.classRank ?? "-"}
                      </td>
                      <td className="p-2 text-zinc-600 md:p-3">
                        {l.gradeRank ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* سه نفر اول */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-600">
                <Award size={18} />
                برترین‌های کلاس
              </div>
              <div className="space-y-2">
                {reportData.top3Class.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-zinc-100 pb-2 text-sm"
                  >
                    <span className="text-zinc-700">
                      {i + 1}. {s.name}
                    </span>
                    <span className="font-bold text-zinc-900">{s.avg}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-600">
                <Award size={18} />
                برترین‌های پایه
              </div>
              <div className="space-y-2">
                {reportData.top3Grade.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-zinc-100 pb-2 text-sm"
                  >
                    <span className="text-zinc-700">
                      {i + 1}. {s.name}{" "}
                      <span className="text-xs text-zinc-400">({s.klass})</span>
                    </span>
                    <span className="font-bold text-zinc-900">{s.avg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* نمودار میله‌ای */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-zinc-800">
              <TrendingUp size={18} className="text-blue-600" />
              نمودار نمرات دروس
            </div>
            <div className="space-y-3">
              {reportData.lessons.map((l, i) => {
                const score = l.score ?? 0;
                const width = (score / 20) * 100;
                return (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <span
                      className="w-24 truncate text-left text-zinc-600"
                      dir="rtl"
                    >
                      {l.lessonTitle}
                    </span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className={`h-full rounded-full ${
                          score >= 10 ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <span className="w-8 text-left font-bold text-zinc-800">
                      {l.score ?? "-"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
