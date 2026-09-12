"use client";

import { useState, useTransition } from "react";
import { toast } from "react-toastify";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { updateDisiplinaryAction } from "@/actions/disciplinaryActions";

interface Props {
  disiplinary: {
    id: string;
    date: string | Date;
    startTime: string;
    reason: string;
    studentName: string;
  };
  setOpen: (open: boolean) => void;
}

export default function DisiplinaryEditForm({ disiplinary, setOpen }: Props) {
  // تبدیل تاریخ اولیه به فرمت YYYY-MM-DD
  const getInitialDateStr = () => {
    const d = new Date(disiplinary.date);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  // State
  const [date, setDate] = useState<string>(getInitialDateStr());
  const [startTime, setStartTime] = useState(disiplinary.startTime);

  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState<string>(disiplinary.reason || "");
  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!date || !startTime || !reason) {
      toast.error("همه فیلدها الزامی است");
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateDisiplinaryAction({
          id: disiplinary.id,
          date: date, // رشته خالص به فرمت "YYYY-MM-DD"
          startTime,
          reason,
        });

        if (result.status === "error") {
          toast.error(result.error.toString() || "خطا در ویرایش  ");
        } else {
          toast.success("  با موفقیت ویرایش شد");
          setOpen(false);
        }
      } catch (error) {
        console.error(error);
        toast.error("خطا در ویرایش  ");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 text-sm">
      {/* اطلاعات دانش‌آموز */}
      <div className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
        دانش‌آموز:{" "}
        <strong className="text-zinc-900 dark:text-white">
          {disiplinary.studentName}
        </strong>
      </div>

      <div>
        <label className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
          تاریخ
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

      {/* ساعت شروع و  */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
            ساعت شروع
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-lg border border-zinc-300  py-2 text-sm text-center dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
            توضیحات / دلیل
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="مورد بی انضباطی"
            className="w-full rounded-lg border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>
      </div>

      {/* دکمه‌ها */}
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
