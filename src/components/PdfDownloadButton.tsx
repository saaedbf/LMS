"use client";

import { useState, type ReactElement } from "react";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import { toast } from "react-toastify";
import { Loader2, FileDown } from "lucide-react";

type Props<TData> = {
  apiUrl: string;
  body?: unknown;
  renderPdf: (data: TData) => ReactElement<DocumentProps>;
  fileName: string;
  label?: string;
  className?: string;
};

export default function PdfDownloadButton<TData>({
  apiUrl,
  body,
  renderPdf,
  fileName,
  label = "دانلود PDF",
  className,
}: Props<TData>) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "خطا در دریافت داده");
        return;
      }

      const json = (await res.json()) as { data: TData };

      // ⬇⬇ cast به DocumentProps
      const blob = await pdf(
        renderPdf(json.data) as ReactElement<DocumentProps>,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success("PDF آماده شد");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "خطا در ساخت PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className={
        className ||
        "inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      }
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          در حال ساخت PDF...
        </>
      ) : (
        <>
          <FileDown size={16} />
          {label}
        </>
      )}
    </button>
  );
}
