"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { getStudentReport } from "@/actions/studentReportActions";
import { Loader2, Award, BookOpen, TrendingUp } from "lucide-react";
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
              setReportData(null); // پاک کردن کارنامه قبلی
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
          {/* کارت‌های آمار */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
              <div className="text-xs text-zinc-500 mb-1">معدل کل</div>
              <div className="text-xl font-bold text-emerald-600">
                {reportData.studentAverage.toFixed(2)}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
              <div className="text-xs text-zinc-500 mb-1">رتبه در کلاس</div>
              <div className="text-xl font-bold text-blue-600">
                {reportData.classRank}{" "}
                <span className="text-xs font-normal text-zinc-400">
                  از {reportData.classSize}
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
              <div className="text-xs text-zinc-500 mb-1">رتبه در پایه</div>
              <div className="text-xl font-bold text-indigo-600">
                {reportData.gradeRank}{" "}
                <span className="text-xs font-normal text-zinc-400">
                  از {reportData.gradeSize}
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
              <div className="text-xs text-zinc-500 mb-1">تعداد دروس</div>
              <div className="text-xl font-bold text-zinc-800">
                {reportData.lessons.length}
              </div>
            </div>
          </div>

          {/* جدول دروس */}
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-zinc-200 bg-zinc-50 p-4">
              <h2 className="text-sm font-bold text-zinc-800">نمرات دروس</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-zinc-50 text-xs text-zinc-500">
                  <tr>
                    <th className="p-3">نام درس</th>
                    <th className="p-3">واحد</th>
                    <th className="p-3">دبیر</th>
                    <th className="p-3">نمره</th>
                    <th className="p-3">رتبه کلاس</th>
                    <th className="p-3">رتبه پایه</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {reportData.lessons.map((l, i) => (
                    <tr key={i} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-3 font-medium text-zinc-800">
                        {l.lessonTitle}
                      </td>
                      <td className="p-3 text-zinc-600">{l.units}</td>
                      <td className="p-3 text-zinc-500">{l.teacherName}</td>
                      <td className="p-3">
                        <span
                          className={`font-bold ${l.score && l.score >= 10 ? "text-emerald-600" : "text-rose-600"}`}
                        >
                          {l.score ?? l.descriptiveValue ?? "-"}
                        </span>
                      </td>
                      <td className="p-3 text-zinc-600">
                        {l.classRank ?? "-"}
                      </td>
                      <td className="p-3 text-zinc-600">
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
              <div className="flex items-center gap-2 mb-3 text-sm font-bold text-amber-600">
                <Award size={18} />
                برترین‌های کلاس
              </div>
              <div className="space-y-2">
                {reportData.top3Class.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm border-b border-zinc-100 pb-2"
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
              <div className="flex items-center gap-2 mb-3 text-sm font-bold text-amber-600">
                <Award size={18} />
                برترین‌های پایه
              </div>
              <div className="space-y-2">
                {reportData.top3Grade.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm border-b border-zinc-100 pb-2"
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
            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-zinc-800">
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
                      className="w-24 truncate text-zinc-600 text-left"
                      dir="rtl"
                    >
                      {l.lessonTitle}
                    </span>
                    <div className="flex-1 h-3 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${score >= 10 ? "bg-emerald-500" : "bg-rose-500"}`}
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
