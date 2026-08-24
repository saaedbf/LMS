"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

type SelectValue = string | number;

export type SearchableSelectOption<T extends SelectValue = number> = {
  id: T;
  title: string;
};

type SearchableSelectProps<T extends SelectValue = number> = {
  title: string;
  options: SearchableSelectOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  clearValue?: T;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  wrapperClass?: string;
  disabled?: boolean;
  required?: boolean;
};

export default function SearchableSelect<T extends SelectValue = number>({
  title,
  options = [],
  value,
  onChange,
  clearValue,
  onBlur,
  placeholder = "انتخاب کنید...",
  error,
  wrapperClass = "",
  disabled = false,
  required = false,
}: SearchableSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SearchableSelectOption<T> | null>(
    null,
  );

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const resolvedClearValue = (clearValue ?? 0) as T;

  // پیدا کردن گزینه انتخاب‌شده
  useEffect(() => {
    if (value !== undefined && value !== resolvedClearValue && value !== "") {
      const found = options.find((option) => option.id === value);
      setSelected(found ?? null);
    } else {
      setSelected(null);
    }
  }, [value, options, resolvedClearValue]);

  // اگر options تغییر کرد و value معتبر نیست، ریست کن
  useEffect(() => {
    if (options.length > 0 && value) {
      const isValid = options.some((option) => option.id === value);
      if (!isValid) {
        onChange(options[0].id);
      }
    }
  }, [options, value, onChange]);

  // بستن Dropdown با کلیک خارج از کامپوننت
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // فوکوس روی input جست‌وجو هنگام بازشدن
  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen]);

  // فیلترکردن گزینه‌ها بر اساس جست‌وجو
  const filteredOptions = options.filter((option) =>
    option.title.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  );

  const handleSelect = (option: SearchableSelectOption<T>) => {
    setSelected(option);
    onChange(option.id);
    setIsOpen(false);
    setSearch("");
  };

  const clearSelection = () => {
    setSelected(null);
    onChange(resolvedClearValue);
    setSearch("");
    setIsOpen(false);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && options.length > 0) {
      setIsOpen((prev) => !prev);
      if (!isOpen) {
        setSearch("");
      }
    }
  };

  const inputId = `select-${title.replace(/\s/g, "-")}`;

  // تعیین کلاس border بر اساس error و selected
  const getBorderClass = () => {
    if (error) return "border-red-500";
    if (selected) return "border-[#3447f7]";
    return "border-[#3447f7]";
  };

  // تعیین placeholder بر اساس وضعیت
  const getPlaceholder = () => {
    if (disabled && options.length === 0) return "گزینه‌ای موجود نیست";
    if (disabled) return placeholder;
    if (options.length === 0) return "گزینه‌ای موجود نیست";
    return placeholder;
  };

  return (
    <div className={`flex w-full flex-col ${wrapperClass}`}>
      <label
        htmlFor={inputId}
        className="relative top-3 z-10 mr-2 w-fit bg-white px-2 text-[#283df5]"
      >
        {title}
        {required && <span className="mr-1 text-red-500">*</span>}
      </label>

      <div className="relative" ref={wrapperRef}>
        {/* نمایشگر انتخاب */}
        <div
          className={`
            flex w-full cursor-pointer items-center justify-between
            rounded-md border-2 bg-white p-3
            ${getBorderClass()}
            ${
              disabled
                ? "cursor-not-allowed bg-gray-100 opacity-70"
                : "hover:border-blue-500"
            }
            transition-colors duration-200
          `}
          onClick={toggleDropdown}
          onBlur={onBlur}
        >
          <span className={selected ? "text-gray-900" : "text-gray-400"}>
            {selected ? selected.title : getPlaceholder()}
          </span>

          <div className="flex shrink-0 items-center gap-1">
            {selected && !disabled && (
              <X
                className="h-4 w-4 cursor-pointer text-gray-400 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
              />
            )}

            <ChevronDown
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {/* Dropdown با استفاده از position: sticky و max-height */}
        {isOpen && !disabled && options.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute left-0 z-[9999] w-full rounded-md border border-[#3447f7] bg-white shadow-lg"
            style={{
              maxHeight: "300px",
              position: "absolute",
              top: "100%",
              marginTop: "4px",
            }}
          >
            {/* جست‌وجو */}
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50 p-2">
              <div className="flex items-center rounded-md border border-[#3447f7] bg-white px-3 py-1">
                <Search className="h-4 w-4 text-gray-400" />

                <input
                  id={inputId}
                  ref={inputRef}
                  type="text"
                  className="w-full bg-transparent px-2 py-1 text-sm outline-none"
                  placeholder="جست‌وجو..."
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                  }}
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsOpen(false);
                    }
                  }}
                />
              </div>
            </div>

            {/* لیست گزینه‌ها */}
            <div className="overflow-y-auto" style={{ maxHeight: "240px" }}>
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-center text-sm text-gray-500">
                  موردی یافت نشد
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`
                      cursor-pointer border-b border-gray-100 px-4
                      py-2.5 text-sm transition-colors
                      last:border-b-0 hover:bg-blue-50
                      ${
                        selected?.id === option.id
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-900"
                      }
                    `}
                    onClick={() => {
                      handleSelect(option);
                    }}
                  >
                    {option.title}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && <span className="mr-1 mt-1 text-sm text-red-600">{error}</span>}
    </div>
  );
}
