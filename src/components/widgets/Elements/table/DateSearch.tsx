// components/widgets/Elements/table/DateSearch.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Calendar } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

type Props = {
  field: string;
};

export default function DateSearch({ field }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  // مقداردهی اولیه از URL
  useEffect(() => {
    if (searchParams.get("searchField") === field) {
      const searchValue = searchParams.get("searchValue");
      if (searchValue) {
        const date = new Date(searchValue);
        if (!isNaN(date.getTime())) {
          setSelectedDate(date);
          setTempDate(date);
          return;
        }
      }
    }
    setSelectedDate(null);
    setTempDate(null);
  }, [searchParams, field]);

  const handleSearch = (date: Date | null) => {
    if (date) {
      // تبدیل به فرمت ISO برای جستجو
      const pad = (n: number) => String(n).padStart(2, "0");
      const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

      const params = new URLSearchParams(searchParams.toString());
      params.set("searchField", field);
      params.set("searchValue", dateStr);
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    } else {
      // اگر تاریخ null بود، جستجو را پاک کن
      const params = new URLSearchParams(searchParams.toString());
      params.delete("searchField");
      params.delete("searchValue");
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedDate(null);
    setTempDate(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("searchField");
    params.delete("searchValue");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  };

  const handleDateChange = (date: any) => {
    if (date) {
      // اگر date شیء DateObject است
      let gregorianDate: Date;
      if (date.toDate) {
        gregorianDate = date.toDate();
      } else {
        gregorianDate = new Date(date);
      }
      setTempDate(gregorianDate);
    } else {
      setTempDate(null);
    }
  };

  const handleApply = () => {
    handleSearch(tempDate);
  };

  const isActive = searchParams.get("searchField") === field;
  const displayDate = selectedDate
    ? selectedDate.toLocaleDateString("fa-IR")
    : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`ml-2 inline-flex items-center gap-2 justify-center transition-colors ${
            isActive
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          <Search size={18} />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-3" align="start">
        <div className="space-y-3">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
            انتخاب تاریخ (شمسی)
          </label>

          <div className="relative">
            <DatePicker
              value={tempDate}
              onChange={handleDateChange}
              calendar={persian}
              locale={persian_fa}
              calendarPosition="bottom-right"
              format="YYYY/MM/DD"
              containerClassName="w-full"
              inputClass="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="انتخاب تاریخ..."
              editable={false}
              onlyMonthPicker={false}
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {displayDate && (
            <div className="text-xs text-gray-500">
              تاریخ انتخاب شده: {displayDate}
            </div>
          )}

          <div className="flex gap-2 items-center justify-end mt-2">
            <button
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
              onClick={handleClear}
            >
              پاک کردن
            </button>
            <button
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
              onClick={handleApply}
              disabled={!tempDate}
            >
              جستجو
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
