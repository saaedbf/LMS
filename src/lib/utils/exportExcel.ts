"use client";

import * as XLSX from "xlsx";

type Column<T> = {
  key: keyof T | string;
  title: string;
  width?: number;
  render?: (row: T) => string | number;
};

/**
 * خروجی اکسل عمومی
 */
export function exportToExcel<T>({
  data,
  columns,
  fileName,
  sheetName = "Sheet1",
}: {
  data: T[];
  columns: Column<T>[];
  fileName: string;
  sheetName?: string;
}) {
  if (!data || data.length === 0) {
    return { ok: false, message: "داده‌ای برای خروجی وجود ندارد" };
  }

  // تبدیل داده به آرایه‌ای از آبجکت‌ها با عنوان فارسی
  const rows = data.map((row) => {
    const obj: Record<string, string | number> = {};
    for (const col of columns) {
      let value: any;
      if (col.render) {
        value = col.render(row);
      } else {
        value = (row as any)[col.key];
      }
      obj[col.title] = value ?? "";
    }
    return obj;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // تنظیم عرض ستون‌ها
  worksheet["!cols"] = columns.map((c) => ({ wch: c.width ?? 18 }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, fileName);

  return { ok: true };
}
