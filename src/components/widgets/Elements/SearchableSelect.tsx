// components/widgets/Elements/SearchableSelect.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";

type Option = {
  id: number;
  title: string;
};

type Props = {
  title: string;
  options: Option[];
  value?: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  wrapperClass?: string;
  disabled?: boolean;
};

export default function SearchableSelect({
  title,
  options,
  value,
  onChange,
  onBlur,
  placeholder = "انتخاب کنید...",
  error,
  wrapperClass,
  disabled = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Option | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // پیدا کردن گزینه انتخاب شده
  useEffect(() => {
    if (value) {
      const found = options.find((opt) => opt.id === value);
      setSelected(found || null);
    } else {
      setSelected(null);
    }
  }, [value, options]);

  // بستن dropdown با کلیک خارج
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // فوکوس روی input جستجو هنگام باز شدن
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // فیلتر کردن گزینه‌ها بر اساس جستجو
  const filteredOptions = options.filter((opt) =>
    opt.title.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (option: Option) => {
    setSelected(option);
    onChange(option.id);
    setIsOpen(false);
    setSearch("");
  };

  const clearSelection = () => {
    setSelected(null);
    onChange(0);
    setSearch("");
  };

  const inputId = `select-${title.replace(/\s/g, "-")}`;

  // ✅ تعیین کلاس border بر اساس error و selected
  const getBorderClass = () => {
    if (error) return "border-red-500";
    if (selected) return "border-[#3447f7]";
    return "border-[#3447f7]";
  };

  return (
    <div className={`flex flex-col w-60 ${wrapperClass ?? ""}`}>
      <label
        htmlFor={inputId}
        className="text-[#283df5] relative top-3 mr-2 px-2 bg-white w-fit z-10"
      >
        {title}
      </label>

      <div className="relative" ref={wrapperRef}>
        {/* نمایشگر انتخاب */}
        <div
          className={`
            p-3 border-2 rounded-md bg-white cursor-pointer
            flex items-center justify-between
            ${getBorderClass()}
            ${disabled ? "bg-gray-100 cursor-not-allowed opacity-70" : "hover:border-blue-500"}
            transition-colors duration-200
            w-full
          `}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onBlur={onBlur}
        >
          <span className={selected ? "text-gray-900" : "text-gray-400"}>
            {selected ? selected.title : placeholder}
          </span>

          <div className="flex items-center gap-1 shrink-0">
            {selected && !disabled && (
              <X
                className="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
              />
            )}
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {/* منوی dropdown */}
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-[#3447f7] rounded-md shadow-lg max-h-60 flex flex-col overflow-hidden">
            {/* جستجو */}
            <div className="p-2 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center px-3 py-1 bg-white border border-[#3447f7] rounded-md">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full px-2 py-1 bg-transparent outline-none text-sm"
                  placeholder="جستجو..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* لیست گزینه‌ها */}
            <div className="overflow-y-auto flex-1">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  موردی یافت نشد
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`
                      px-4 py-2.5 text-sm cursor-pointer hover:bg-blue-50 transition-colors
                      ${selected?.id === option.id ? "bg-blue-100 text-blue-700" : "text-gray-900"}
                      border-b border-gray-100 last:border-b-0
                    `}
                    onClick={() => handleSelect(option)}
                  >
                    {option.title}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && <span className="text-red-600 text-sm mt-1 mr-1">{error}</span>}
    </div>
  );
}
