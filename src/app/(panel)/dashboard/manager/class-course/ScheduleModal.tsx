"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ActionModal from "@/components/widgets/ActionModal";
import {
  getScheduleForClassCourse,
  saveClassSchedule,
} from "@/actions/scheduleActions";
import { Calendar } from "lucide-react";
import { DayOfWeek } from "@prisma/client";

const DAYS_MAP: Record<DayOfWeek, string> = {
  SATURDAY: "شنبه",
  SUNDAY: "یکشنبه",
  MONDAY: "دوشنبه",
  TUESDAY: "سه‌شنبه",
  WEDNESDAY: "چهارشنبه",
  THURSDAY: "پنجشنبه",
};

const DAYS_ORDER: DayOfWeek[] = [
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
];

type Props = {
  classCourseId: string;
  lessonTitle: string;
  bellCount: number;
  hasSchedule?: boolean; // ⬅️ اضافه شود
};

export default function ScheduleModal({
  classCourseId,
  lessonTitle,
  bellCount,
  hasSchedule = false, // ⬅️ اضافه شود
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [schedule, setSchedule] = useState<
    Record<string, { active: boolean; isHalf: boolean }>
  >({});

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getScheduleForClassCourse(classCourseId).then((res) => {
      if (res.status === "success" && res.data) {
        const initial: Record<string, { active: boolean; isHalf: boolean }> =
          {};
        res.data.forEach((s) => {
          initial[`${s.day}-${s.bellIndex}`] = {
            active: true,
            isHalf: s.isHalfBell,
          };
        });
        setSchedule(initial);
      }
      setLoading(false);
    });
  }, [open, classCourseId]);

  const toggleCell = (day: DayOfWeek, bell: number) => {
    const key = `${day}-${bell}`;
    setSchedule((prev) => {
      const current = prev[key] || { active: false, isHalf: false };
      return { ...prev, [key]: { ...current, active: !current.active } };
    });
  };

  const toggleHalf = (day: DayOfWeek, bell: number) => {
    const key = `${day}-${bell}`;
    setSchedule((prev) => {
      const current = prev[key] || { active: false, isHalf: false };
      return { ...prev, [key]: { ...current, isHalf: !current.isHalf } };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = Object.entries(schedule)
      .filter(([_, val]) => val.active)
      .map(([key, val]) => {
        const [day, bellStr] = key.split("-");
        return {
          day: day as DayOfWeek,
          bellIndex: Number(bellStr),
          isHalfBell: val.isHalf,
        };
      });

    const res = await saveClassSchedule(classCourseId, payload);
    setSaving(false);

    if (res.status === "error") {
      toast.error(res.error);
    } else {
      toast.success("برنامه با موفقیت ذخیره شد");
      setOpen(false);
    }
  };

  return (
    <ActionModal
      title={`برنامه هفتگی: ${lessonTitle}`}
      desc="برای انتخاب زنگ‌ها کلیک کنید. دکمه (نصف) برای زنگ‌های نیم‌ساعته است."
      open={open}
      setOpen={setOpen}
      trigger={
        <button
          className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors ${
            hasSchedule
              ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" // ⬅️ سبز (دارای برنامه)
              : "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100" // ⬅️ آبی (بدون برنامه)
          }`}
        >
          <Calendar size={14} />
          برنامه
        </button>
      }
      contentClassName="w-[95vw] max-w-5xl"
    >
      {loading ? (
        <p className="p-6 text-center text-sm text-gray-500">
          در حال بارگذاری...
        </p>
      ) : (
        <div className="space-y-4 p-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-center">
              {/* ⬅️ سطر اول: زنگ‌ها در ستون‌ها */}
              <thead>
                <tr>
                  <th className="border border-zinc-300 bg-zinc-100 p-2 text-sm">
                    روز / زنگ
                  </th>
                  {Array.from({ length: bellCount }).map((_, idx) => (
                    <th
                      key={idx}
                      className="border border-zinc-300 bg-zinc-100 p-2 text-sm"
                    >
                      زنگ {idx + 1}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* ⬅️ سطرها: روزهای هفته */}
              <tbody>
                {DAYS_ORDER.map((day) => (
                  <tr key={day}>
                    <td className="border border-zinc-300 bg-zinc-50 p-2 text-sm font-bold">
                      {DAYS_MAP[day]}
                    </td>
                    {Array.from({ length: bellCount }).map((_, idx) => {
                      const bell = idx + 1;
                      const key = `${day}-${bell}`;
                      const cell = schedule[key] || {
                        active: false,
                        isHalf: false,
                      };

                      return (
                        <td key={bell} className="border border-zinc-300 p-1">
                          <div className="flex flex-col items-center gap-1">
                            <button
                              type="button"
                              onClick={() => toggleCell(day, bell)}
                              className={`h-10 w-full rounded transition ${
                                cell.active
                                  ? "bg-emerald-500 text-white shadow-sm"
                                  : "bg-zinc-50 hover:bg-zinc-200 border border-zinc-200"
                              }`}
                            >
                              {cell.active ? "انتخاب شده" : "-"}
                            </button>

                            {cell.active && (
                              <label className="flex cursor-pointer items-center gap-1 text-[10px] text-zinc-600">
                                <input
                                  type="checkbox"
                                  checked={cell.isHalf}
                                  onChange={() => toggleHalf(day, bell)}
                                  className="h-3 w-3"
                                />
                                نصف زنگ
                              </label>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end border-t pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "در حال ذخیره..." : "ذخیره برنامه"}
            </button>
          </div>
        </div>
      )}
    </ActionModal>
  );
}
