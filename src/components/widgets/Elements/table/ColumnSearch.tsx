"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

type Props = {
  field: string;
  placeholder?: string;
  type?: "text" | "date" | "select";
  options?: { label: string; value: string }[];
};

export default function ColumnSearch({
  field,
  placeholder = "جستجو...",
  type = "text",
  options = [],
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(
    searchParams.get("searchField") === field
      ? searchParams.get("searchValue") || ""
      : "",
  );

  // همگام‌سازی با تغییرات URL
  useEffect(() => {
    if (searchParams.get("searchField") === field) {
      setValue(searchParams.get("searchValue") || "");
    } else {
      setValue("");
    }
  }, [searchParams, field]);

  const handleSearch = (val: string) => {
    setValue(val);

    const params = new URLSearchParams(searchParams.toString());

    if (val.trim()) {
      params.set("searchField", field);
      params.set("searchValue", val.trim());
    } else {
      params.delete("searchField");
      params.delete("searchValue");
    }

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  };

  const handleClear = () => {
    setValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("searchField");
    params.delete("searchValue");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  };

  // تشخیص اینکه آیا فیلد فعال است
  const isActive = searchParams.get("searchField") === field;

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

      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            جستجو در {placeholder}
          </label>

          {type === "select" ? (
            <select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">همه</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type === "date" ? "date" : "text"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(value);
                }
              }}
            />
          )}

          <div className="flex gap-2 items-center justify-end mt-2">
            <button
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
              onClick={handleClear}
            >
              لغو
            </button>
            <button
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
              onClick={() => handleSearch(value)}
            >
              جستجو
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
