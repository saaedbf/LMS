"use client";

import { FileSpreadsheet } from "lucide-react";

type Props = {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
};

export default function ExportExcelBtn({
  onClick,
  disabled,
  loading,
  label = "خروجی اکسل",
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
    >
      <FileSpreadsheet size={16} />
      {loading ? "در حال ساخت..." : label}
    </button>
  );
}
