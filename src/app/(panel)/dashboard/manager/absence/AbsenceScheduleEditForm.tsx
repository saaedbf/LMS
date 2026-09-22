"use client";

import { useState, useTransition } from "react";
import { toast } from "react-toastify";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { updateAbsenceScheduleAction } from "@/actions/absenceActions";
import { Clock, CalendarDays } from "lucide-react";

interface Props {
  absence: {
    id: string;
    date: string | Date;
    isFullDay: boolean; // ⬅️ اضافه شد
    startTime: string | null; // ⬅️ nullable
    endTime: string | null; // ⬅️ nullable
    studentName: string;
  };
  setOpen: (open: boolean) => void;
}

export default function AbsenceScheduleEditForm({ absence, setOpen }: Props) {
  const getInitialDateStr = () => {
    const d = new Date(absence.date);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const [date, setDate] = useState<string>(getInitialDateStr());
  const [isFullDay, setIsFullDay] = useState(absence.isFullDay);
  const [startTime, setStartTime] = useState(absence.startTime || "07:30");
  const [endTime, setEndTime] = useState(absence.endTime || "09:00");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast.error("تاریخ الزامی است");
      return;
    }

    if (!isFullDay) {
      if (!startTime || !endTime) {
        toast.error("ساعت شروع و پایان الزامی است");
        return;
      }
      if (endTime <= startTime) {
        toast.error("ساعت پایان باید بعد از ساعت شروع باشد");
        return;
      }
    }

    startTransition(async () => {
      try {
        const result = await updateAbsenceScheduleAction({
          id: absence.id,
          date,
          isFullDay,
          startTime: isFullDay ? undefined : startTime,
          endTime: isFullDay ? undefined : endTime,
        });

        if (result.status === "error") {
          toast.error(result.error.toString() || "خطا در ویرایش زمان غیبت");
        } else {
          toast.success("زمان غیبت با موفقیت ویرایش شد");
          setOpen(false);
        }
      } catch (error) {
        console.error(error);
        toast.error("خطا در ویرایش زمان غیبت");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 text-sm">
      <div className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
        دانش‌آموز:{" "}
        <strong className="text-zinc-900 dark:text-white">
          {absence.studentName}
        </strong>
      </div>

      <div>
        <label className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
          تاریخ غیبت (شمسی)
        </label>
        <DatePicker
          value={date ? new Date(date) : new Date()}
          onChange={(selectedDate: any) => {
            if (selectedDate) {
              const gDate: Date = selectedDate.toDate
                ? selectedDate.toDate()
                : new Date(selectedDate);
              const pad = (n: number) => String(n).padStart(2, "0");
              const isoDate = `${gDate.getFullYear()}-${pad(
                gDate.getMonth() + 1,
              )}-${pad(gDate.getDate())}`;
              setDate(isoDate);
            }
          }}
          calendar={persian}
          locale={persian_fa}
          calendarPosition="bottom-right"
          format="YYYY/MM/DD"
          containerClassName="w-full"
          inputClass="w-full rounded-lg border border-zinc-300 p-2 text-sm text-right dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          placeholder="انتخاب تاریخ شمسی..."
          editable={false}
        />
      </div>

      {/* ⬅️ switch روز کامل / ساعتی */}
      <div>
        <label className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
          نوع غیبت
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFullDay(false)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-2 text-xs font-medium transition ${
              !isFullDay
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-950/30 dark:text-blue-300"
                : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400"
            }`}
          >
            <Clock size={14} />
            ساعتی
          </button>
          <button
            type="button"
            onClick={() => setIsFullDay(true)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-2 text-xs font-medium transition ${
              isFullDay
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300"
                : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400"
            }`}
          >
            <CalendarDays size={14} />
            روز کامل
          </button>
        </div>
      </div>

      {/* ⬅️ ساعت‌ها فقط در حالت ساعتی */}
      {!isFullDay && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
              ساعت شروع
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 py-2 text-sm text-center dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
              ساعت پایان
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 py-2 text-sm text-center dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          انصراف
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "در حال ثبت..." : "ذخیره تغییرات"}
        </button>
      </div>
    </form>
  );
}
