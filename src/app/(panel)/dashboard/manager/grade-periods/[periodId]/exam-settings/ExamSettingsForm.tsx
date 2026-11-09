"use client";

import { useState, useTransition } from "react";
import { toast } from "react-toastify";
import { Save, Loader2, BookOpen } from "lucide-react";
import { updateLessonExamSettings } from "@/actions/gradePeriodActions";
import { useRouter } from "next/navigation";

// ⬅️ تایپ جدید
type LessonItem = {
  darsPayeReshtehId: string;
  payeTitle: string;
  lessonTitle: string;
  questionCount: number | null;
  questionRange: string | null;
  gradePeriodLessonIds: string[];
};

export default function ExamSettingsForm({
  periodId,
  lessons,
}: {
  periodId: string;
  lessons: LessonItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State برای نگهداری مقادیر هر ردیف (کلید = darsPayeReshtehId)
  const [values, setValues] = useState<
    Record<string, { count: string; range: string }>
  >(() => {
    const initial: Record<string, { count: string; range: string }> = {};
    for (const l of lessons) {
      initial[l.darsPayeReshtehId] = {
        count: l.questionCount ? String(l.questionCount) : "",
        range: l.questionRange || "",
      };
    }
    return initial;
  });

  const handleChange = (id: string, field: "count" | "range", val: string) => {
    setValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: val },
    }));
  };

  const handleSave = () => {
    const settings: {
      gradePeriodLessonIds: string[];
      questionCount: number;
      questionRange: string;
    }[] = [];

    // اعتبارسنجی
    for (const l of lessons) {
      const v = values[l.darsPayeReshtehId];
      const count = Number(v.count);
      if (!v.count || isNaN(count) || count <= 0) {
        return toast.error(
          `تعداد سوالات برای درس "${l.lessonTitle}" در پایه "${l.payeTitle}" الزامی است`,
        );
      }
      if (!v.range.trim()) {
        return toast.error(
          `محدوده سوالات برای درس "${l.lessonTitle}" در پایه "${l.payeTitle}" الزامی است`,
        );
      }

      settings.push({
        gradePeriodLessonIds: l.gradePeriodLessonIds, // ⬅️ همه‌ی IDها
        questionCount: count,
        questionRange: v.range.trim(),
      });
    }

    startTransition(async () => {
      const res = await updateLessonExamSettings(periodId, settings);
      if (res.status === "error") {
        toast.error(res.error);
      } else {
        toast.success(res.data.message);
        router.push("/dashboard/manager/grade-periods");
      }
    });
  };

  if (lessons.length === 0) {
    return (
      <div className="rounded-xl bg-white p-6 text-center text-sm text-zinc-500">
        درسی برای این دوره یافت نشد.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-right text-sm">
          <thead className="bg-zinc-50 text-xs text-zinc-500">
            <tr>
              <th className="p-3">پایه</th>
              <th className="p-3">درس</th>
              <th className="p-3">تعداد کلاس‌های مشمول</th>
              <th className="p-3">تعداد سوالات</th>
              <th className="p-3">محدوده سوالات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {lessons.map((l) => (
              <tr key={l.darsPayeReshtehId} className="hover:bg-zinc-50">
                <td className="p-3 font-medium text-zinc-800">{l.payeTitle}</td>
                <td className="p-3 text-zinc-600">
                  <div className="flex items-center gap-1.5">
                    <BookOpen size={14} className="text-emerald-500" />
                    {l.lessonTitle}
                  </div>
                </td>
                <td className="p-3 text-xs text-zinc-500">
                  {l.gradePeriodLessonIds.length} کلاس
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    min={1}
                    value={values[l.darsPayeReshtehId]?.count}
                    onChange={(e) =>
                      handleChange(l.darsPayeReshtehId, "count", e.target.value)
                    }
                    className="w-24 rounded-md border border-zinc-300 p-1.5 text-center text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="مثلاً 20"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="text"
                    value={values[l.darsPayeReshtehId]?.range}
                    onChange={(e) =>
                      handleChange(l.darsPayeReshtehId, "range", e.target.value)
                    }
                    className="w-full rounded-md border border-zinc-300 p-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="مثلاً 1-10"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {isPending ? "در حال ذخیره..." : "ذخیره تنظیمات"}
        </button>
      </div>
    </div>
  );
}
