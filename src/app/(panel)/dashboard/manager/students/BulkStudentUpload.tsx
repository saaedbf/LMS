"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import {
  Upload,
  Download,
  ClipboardPaste,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { bulkCreateStudents } from "@/actions/studentBulkActions";

type KlassOption = {
  id: string;
  title: string;
  payeId: number;
  reshtehTahsiliId: number;
  payeTitle: string;
  reshtehTahsiliTitle: string;
};

type Props = {
  setOpen: (open: boolean) => void;
  schoolId: number;
  academicYearId: number;
  klasses: KlassOption[];
};

type ParsedRow = {
  _rowNumber: number;
  _error?: string;
  firstName: string;
  lastName: string;
  nationalCode: string;
  fatherName: string;
  phone: string;
};

export default function BulkStudentUpload({
  setOpen,
  schoolId,
  academicYearId,
  klasses,
}: Props) {
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [selectedKlassId, setSelectedKlassId] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [pasteText, setPasteText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  // ⬅️ توابع نرمال‌سازی (کپی از اسکیما)
  const normalizeNationalCode = (value: string): string => {
    if (!value) return "";
    let str = String(value).trim().replace(/\D/g, "");
    if (str.length === 9) str = "0" + str;
    if (str.length === 8) str = "00" + str;
    return str;
  };

  const normalizePhone = (value: string): string => {
    if (!value) return "";
    let str = String(value).trim().replace(/\D/g, "");
    if (!str) return "";

    if (str.length === 10 && str.startsWith("9")) {
      str = "0" + str;
    }
    if (str.length === 9 && str.startsWith("9")) {
      str = "0" + str;
    }
    if (str.startsWith("98") && str.length === 12) {
      str = "0" + str.substring(2);
    }

    return str;
  };
  const selectedKlass = klasses.find((k) => k.id === selectedKlassId);

  // دانلود فایل نمونه
  const downloadTemplate = () => {
    const template = [
      {
        نام: "علی",
        "نام خانوادگی": "محمدی",
        "کد ملی": "1234567890",
        "نام پدر": "حسن",
        "شماره تماس": "09123456789",
      },
      {
        نام: "زهرا",
        "نام خانوادگی": "احمدی",
        "کد ملی": "0987654321",
        "نام پدر": "محمد",
        "شماره تماس": "09129876543",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    ws["!cols"] = [
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "دانش‌آموزان");
    XLSX.writeFile(wb, "نمونه-ثبت-گروهی-دانش‌آموزان.xlsx");
  };

  // آپلود فایل
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

      if (jsonData.length === 0) {
        toast.error("فایل خالی است");
        return;
      }

      // ⬅️ نرمال‌سازی در همین مرحله
      const rows: ParsedRow[] = jsonData.map((row, idx) => ({
        _rowNumber: idx + 2,
        firstName: String(row["نام"] || "").trim(),
        lastName: String(row["نام خانوادگی"] || "").trim(),
        nationalCode: normalizeNationalCode(String(row["کد ملی"] || "")),
        fatherName: String(row["نام پدر"] || "").trim(),
        phone: normalizePhone(String(row["شماره تماس"] || "")),
      }));

      setParsedRows(rows);
      toast.success(`${rows.length} ردیف خوانده شد`);
    } catch (error) {
      console.error(error);
      toast.error("خطا در خواندن فایل");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // پردازش پیست
  const handlePaste = () => {
    if (!pasteText.trim()) {
      toast.error("متنی برای پردازش وجود ندارد");
      return;
    }

    const lines = pasteText.trim().split("\n");
    const rows: ParsedRow[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(/\t|,|\|/).map((p) => p.trim());

      if (parts.length < 5) {
        rows.push({
          _rowNumber: i + 1,
          firstName: parts[0] || "",
          lastName: parts[1] || "",
          nationalCode: normalizeNationalCode(parts[2] || ""),
          fatherName: parts[3] || "",
          phone: normalizePhone(parts[4] || ""),
          _error: "تعداد ستون‌ها کمتر از ۵ است",
        });
        continue;
      }

      rows.push({
        _rowNumber: i + 1,
        firstName: parts[0],
        lastName: parts[1],
        nationalCode: normalizeNationalCode(parts[2]),
        fatherName: parts[3],
        phone: normalizePhone(parts[4]),
      });
    }

    setParsedRows(rows);
    toast.success(`${rows.length} ردیف پردازش شد`);
  };

  // اعتبارسنجی
  const validateRows = () => {
    return parsedRows.map((row) => {
      const errors: string[] = [];

      if (!row.firstName) errors.push("نام خالی");
      if (!row.lastName) errors.push("نام خانوادگی خالی");
      if (!/^\d{10}$/.test(row.nationalCode)) errors.push("کد ملی نامعتبر");
      if (row.phone && !/^09\d{9}$/.test(row.phone))
        errors.push("شماره تماس نامعتبر");

      const duplicateCount = parsedRows.filter(
        (r) => r.nationalCode === row.nationalCode,
      ).length;
      if (duplicateCount > 1) errors.push("کد ملی تکراری در فایل");

      return {
        ...row,
        _error: errors.length > 0 ? errors.join("، ") : undefined,
      };
    });
  };

  // ارسال
  const handleSubmit = async () => {
    if (!selectedKlassId) {
      toast.error("ابتدا کلاس مقصد را انتخاب کنید");
      return;
    }

    const validated = validateRows();
    setParsedRows(validated);

    const validRows = validated.filter((r) => !r._error);

    if (validRows.length === 0) {
      toast.error("هیچ ردیف معتبری برای ثبت وجود ندارد");
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      const res = await bulkCreateStudents({
        klassId: selectedKlassId,
        students: validRows.map((r) => ({
          firstName: r.firstName,
          lastName: r.lastName,
          nationalCode: r.nationalCode,
          fatherName: r.fatherName,
          phone: r.phone,
        })),
      });

      if (res.status === "error") {
        toast.error(res.error);
      } else {
        setResult(res.data);
        toast.success(`${res.data.created} دانش‌آموز با موفقیت ثبت شد`);

        if (res.data.errors.length === 0) {
          setTimeout(() => setOpen(false), 2000);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("خطا در ثبت گروهی");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validCount = parsedRows.filter((r) => !r._error).length;
  const errorCount = parsedRows.filter((r) => r._error).length;
  const canSubmit =
    selectedKlassId !== "" && parsedRows.length > 0 && validCount > 0;

  return (
    <div className="space-y-1 px-4 py-2 max-h-[80vh]">
      {/* ⬅️ انتخاب کلاس مقصد */}
      <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
        <label className="mb-1 block text-sm font-bold text-blue-900">
          کلاس مقصد:
        </label>
        <select
          value={selectedKlassId}
          onChange={(e) => setSelectedKlassId(e.target.value)}
          className="w-full rounded-lg border border-blue-300 bg-white p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- انتخاب کلاس --</option>
          {klasses.map((k) => (
            <option key={k.id} value={k.id}>
              {k.title} ({k.payeTitle} - {k.reshtehTahsiliTitle})
            </option>
          ))}
        </select>

        {selectedKlass && (
          <div className="mt-1 flex items-center gap-1 text-xs text-blue-700">
            <CheckCircle size={14} />
            <span>
              دانش‌آموزان در کلاس <strong>{selectedKlass.title}</strong> ثبت‌نام
              می‌شوند.
            </span>
          </div>
        )}

        {klasses.length === 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-amber-700">
            <AlertCircle size={14} />
            <span>
              ابتدا باید کلاس تعریف کنید. به بخش "مدیریت کلاس‌ها" بروید.
            </span>
          </div>
        )}
      </div>

      {/* انتخاب روش */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all ${
            mode === "upload"
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
          }`}
        >
          <FileSpreadsheet size={18} />
          آپلود فایل اکسل
        </button>
        <button
          type="button"
          onClick={() => setMode("paste")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all ${
            mode === "paste"
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
          }`}
        >
          <ClipboardPaste size={18} />
          کپی/پیست از اکسل
        </button>
      </div>

      {/* دانلود نمونه */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-700">
            <AlertCircle size={16} />
            <span>فایل نمونه را دانلود کنید و پر کنید</span>
          </div>
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-blue-600 shadow-sm hover:bg-blue-50"
          >
            <Download size={20} />
            دانلود نمونه
          </button>
        </div>
      </div>

      {/* آپلود */}
      {mode === "upload" && (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-4 transition-colors hover:border-blue-400 hover:bg-blue-50/50">
          <Upload size={32} className="text-zinc-400" />
          <span className="mt-2 text-sm font-medium text-zinc-700">
            {isUploading ? "در حال خواندن..." : "فایل اکسل را انتخاب کنید"}
          </span>
          <span className="mt-1 text-xs text-zinc-500">
            فرمت‌های مجاز: .xlsx, .xls, .csv
          </span>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      )}

      {/* پیست */}
      {mode === "paste" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            داده‌ها را از اکسل کپی و اینجا پیست کنید:
          </label>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={4}
            placeholder={`نام\tنام خانوادگی\tکد ملی\tنام پدر\tشماره تماس
علی\tمحمدی\t1234567890\tحسن\t09123456789`}
            className="w-full rounded-lg border border-zinc-300 p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            dir="rtl"
          />
          <button
            type="button"
            onClick={handlePaste}
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <ClipboardPaste size={16} />
            پردازش متن
          </button>
        </div>
      )}

      {/* پیش‌نمایش */}
      {parsedRows.length > 0 && (
        <div className="rounded-lg border border-zinc-200">
          <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 p-1">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-medium">{parsedRows.length} ردیف</span>
              {validCount > 0 && (
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle size={14} />
                  {validCount} معتبر
                </span>
              )}
              {errorCount > 0 && (
                <span className="flex items-center gap-1 text-rose-600">
                  <AlertCircle size={14} />
                  {errorCount} خطا
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setParsedRows([]);
                setPasteText("");
              }}
              className="text-xs text-zinc-500 hover:text-rose-600"
            >
              پاک کردن
            </button>
          </div>

          <div className="max-h-32 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-zinc-100">
                <tr>
                  <th className="p-2 text-right">#</th>
                  <th className="p-2 text-right">نام</th>
                  <th className="p-2 text-right">کد ملی</th>
                  <th className="p-2 text-right">تلفن</th>
                  <th className="p-2 text-right">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {parsedRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-zinc-100 ${
                      row._error ? "bg-rose-50" : ""
                    }`}
                  >
                    <td className="p-2 text-zinc-500">{row._rowNumber}</td>
                    <td className="p-2">
                      {row.firstName} {row.lastName}
                    </td>
                    <td className="p-2 font-mono">{row.nationalCode}</td>
                    <td className="p-2 font-mono">{row.phone}</td>
                    <td className="p-2">
                      {row._error ? (
                        <span className="text-rose-600">{row._error}</span>
                      ) : (
                        <CheckCircle size={14} className="text-emerald-500" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* نتیجه */}
      {result && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-bold text-zinc-800">
            نتیجه ثبت گروهی
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {result.total}
              </div>
              <div className="text-xs text-blue-700">کل</div>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {result.created}
              </div>
              <div className="text-xs text-emerald-700">موفق</div>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-center">
              <div className="text-2xl font-bold text-rose-600">
                {result.skipped}
              </div>
              <div className="text-xs text-rose-700">ناموفق</div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="mt-3 max-h-40 overflow-y-auto rounded-lg border border-rose-200 bg-rose-50 p-3">
              <div className="mb-2 text-xs font-bold text-rose-700">خطاها:</div>
              <ul className="space-y-1 text-xs text-rose-600">
                {result.errors.map((e: any, idx: number) => (
                  <li key={idx}>
                    ردیف {e.row} ({e.nationalCode}): {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* دکمه‌ها */}
      <div className="flex justify-end gap-2 border-t border-zinc-200 pt-1">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          انصراف
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !canSubmit}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              در حال ثبت...
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              ثبت {validCount} دانش‌آموز
              {selectedKlass && ` در ${selectedKlass.title}`}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
