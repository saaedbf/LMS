"use client";

import { useState, useEffect } from "react";
import { Eye, Loader2, X } from "lucide-react";
import ActionModal from "@/components/widgets/ActionModal";
import { getKlassSchedule } from "@/actions/classScheduleActions";

const DAYS: Record<string, string> = {
  SATURDAY: "شنبه",
  SUNDAY: "یکشنبه",
  MONDAY: "دوشنبه",
  TUESDAY: "سه‌شنبه",
  WEDNESDAY: "چهارشنبه",
  THURSDAY: "پنجشنبه",
};

const DAYS_ORDER = [
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
];

type Props = {
  klassId: string;
  bellCount: number;
};

type ScheduleItem = {
  day: string;
  bellIndex: number;
  isHalfBell: boolean;
  darsTitle: string;
  teacherName: string;
};

export default function ViewClassScheduleModal({ klassId, bellCount }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getKlassSchedule(klassId).then((res) => {
      if (res.status === "success" && res.data) {
        setSchedules(res.data);
      }
      setLoading(false);
    });
  }, [open, klassId]);

  const scheduleMap = new Map<string, ScheduleItem[]>();
  for (const s of schedules) {
    const key = `${s.day}-${s.bellIndex}`;
    const list = scheduleMap.get(key) ?? [];
    list.push(s);
    scheduleMap.set(key, list);
  }

  return (
    <ActionModal
      title="برنامه هفتگی کلاس"
      open={open}
      setOpen={setOpen}
      desc=""
      trigger={
        <button
          className="flex items-center gap-1 rounded-md border border-violet-300 bg-violet-50 px-2 py-1 text-xs text-violet-700 hover:bg-violet-100"
          title="مشاهده برنامه هفتگی کلاس"
        >
          <Eye size={14} />
          برنامه کلاس
        </button>
      }
      contentClassName="w-[95vw] max-w-4xl"
    >
      {loading ? (
        <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
          <Loader2 className="ml-2 animate-spin" size={18} />
          در حال بارگذاری...
        </div>
      ) : (
        <>
          <div className="overflow-x-auto p-4">
            <table
              className="w-full border-collapse text-center text-xs"
              dir="rtl"
            >
              <thead>
                <tr className="bg-indigo-900 text-white">
                  <th className="w-[12%] border border-indigo-900 p-2">
                    روز/زنگ
                  </th>
                  {Array.from({ length: bellCount }).map((_, idx) => (
                    <th key={idx} className="border border-indigo-900 p-2">
                      زنگ {idx + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS_ORDER.map((day) => (
                  <tr key={day} className="border-b border-zinc-200">
                    <td className="bg-indigo-50 p-2 font-bold text-indigo-900">
                      {DAYS[day]}
                    </td>
                    {Array.from({ length: bellCount }).map((_, idx) => {
                      const bell = idx + 1;
                      const items = scheduleMap.get(`${day}-${bell}`) ?? [];

                      return (
                        <td
                          key={bell}
                          className="relative border-l border-zinc-200 p-0"
                          style={{ height: "60px" }}
                        >
                          {items.length === 0 ? (
                            <span className="text-zinc-300">-</span>
                          ) : items.length === 1 && !items[0].isHalfBell ? (
                            /* حالت ۱: تمام زنگ */
                            <div className="flex h-full flex-col items-center justify-center">
                              <span className="font-bold text-indigo-700">
                                {items[0].darsTitle}
                              </span>
                              <span className="mt-1 text-[10px] text-zinc-500">
                                {items[0].teacherName}
                              </span>
                            </div>
                          ) : (
                            /* حالت ۲: نصف زنگ */
                            <div className="relative h-full w-full">
                              {/* خط مورب */}
                              <svg className="absolute inset-0 h-full w-full">
                                <line
                                  x1="0"
                                  y1="0"
                                  x2="100%"
                                  y2="100%"
                                  stroke="#f59e0b"
                                  strokeWidth="1"
                                />
                              </svg>

                              {/* نیمه اول: راست-بالا */}
                              {items[0] && (
                                <div
                                  className="absolute top-0 right-0 w-1/2 h-1/2 flex flex-col justify-center items-start pr-2"
                                  style={{ direction: "rtl" }}
                                >
                                  <span className="text-[10px] font-bold text-indigo-700">
                                    {items[0].darsTitle}
                                  </span>
                                  <span className="text-[9px] text-zinc-500">
                                    {items[0].teacherName}
                                  </span>
                                </div>
                              )}

                              {/* نیمه دوم: چپ-پایین */}
                              {items[1] && (
                                <div
                                  className="absolute bottom-0 left-0 w-1/2 h-1/2 flex flex-col justify-center items-end pl-2"
                                  style={{ direction: "rtl" }}
                                >
                                  <span className="text-[10px] font-bold text-indigo-700">
                                    {items[1].darsTitle}
                                  </span>
                                  <span className="text-[9px] text-zinc-500">
                                    {items[1].teacherName}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ⬅️ دکمه بستن */}
          <div className="flex justify-end border-t border-zinc-200 p-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
            >
              <X size={16} />
              بستن
            </button>
          </div>
        </>
      )}
    </ActionModal>
  );
}
