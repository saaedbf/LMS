"use client";

import { useState, useTransition } from "react";
import { toast } from "react-toastify";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { updateEncouragementAction } from "@/actions/encouragementActions";
import TimePicker from "@/components/ui/TimePicker";

interface Props {
  encouragement: {
    id: string;
    date: string | Date;
    startTime: string;
    reason: string;
    type: string;
    studentName: string;
  };
  setOpen: (open: boolean) => void;
}

export default function EncouragementEditForm({
  encouragement,
  setOpen,
}: Props) {
  const getInitialDateStr = () => {
    const d = new Date(encouragement.date);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const [date, setDate] = useState<string>(getInitialDateStr());
  const [startTime, setStartTime] = useState(encouragement.startTime);
  const [reason, setReason] = useState<string>(encouragement.reason || "");
  const [type, setType] = useState<string>(encouragement.type || "EDUCATIONAL");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !startTime || !reason)
      return toast.error("همه فیلدها الزامی است");

    startTransition(async () => {
      const result = await updateEncouragementAction({
        id: encouragement.id,
        date,
        startTime,
        reason,
        type,
      });

      if (result.status === "error") {
        toast.error(result.error.toString());
      } else {
        toast.success("با موفقیت ویرایش شد");
        setOpen(false);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 text-sm">
      <div className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600">
        دانش‌آموز:{" "}
        <strong className="text-zinc-900">{encouragement.studentName}</strong>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block font-medium">تاریخ</label>
          <DatePicker
            value={date ? new Date(date) : new Date()}
            onChange={(selectedDate: any) => {
              if (selectedDate) {
                const gDate: Date = selectedDate.toDate
                  ? selectedDate.toDate()
                  : new Date(selectedDate);
                const pad = (n: number) => String(n).padStart(2, "0");
                setDate(
                  `${gDate.getFullYear()}-${pad(gDate.getMonth() + 1)}-${pad(gDate.getDate())}`,
                );
              }
            }}
            calendar={persian}
            locale={persian_fa}
            format="YYYY/MM/DD"
            editable={false}
            containerClassName="w-full"
            inputClass="w-full rounded-lg border p-2 text-sm text-right"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <TimePicker
            label="ساعت شروع"
            value={startTime}
            onChange={setStartTime}
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block font-medium">نوع تشویق</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-lg border p-2 text-sm"
        >
          <option value="EDUCATIONAL">آموزشی</option>
          <option value="CULTURAL">پرورشی</option>
          <option value="DISCIPLINARY">انضباطی</option>
          <option value="COMPETITIONS">مسابقات</option>
          <option value="KHAVARAZMI">جشنواره خوارزمی</option>
          <option value="OTHER">سایر</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block font-medium">توضیحات / دلیل</label>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-lg border p-2 text-sm"
        />
      </div>

      <div className="flex justify-end gap-2 pt-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border px-4 py-2 text-xs"
        >
          انصراف
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-5 py-2 text-xs text-white"
        >
          {isPending ? "در حال ثبت..." : "ذخیره تغییرات"}
        </button>
      </div>
    </form>
  );
}
