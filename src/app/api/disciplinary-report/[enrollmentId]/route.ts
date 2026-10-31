import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import path from "path";
import fs from "fs/promises";
import { DisciplinaryReportPdf } from "@/lib/pdf/DisciplinaryReportPdf";
import { getStudentDisciplinaryReport } from "@/actions/disciplinaryReportActions";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> },
) {
  try {
    const { enrollmentId } = await params;

    // ۱. دریافت داده‌های کارنامه
    const res = await getStudentDisciplinaryReport(enrollmentId);
    if (res.status === "error") {
      return new Response(JSON.stringify({ error: res.error }), {
        status: 400,
      });
    }

    // ۲. خواندن فونت‌ها
    const fontDir = path.join(
      process.cwd(),
      "public",
      "fonts",
      "iransans-fanum",
      "ttf",
    );
    const regularFontBuffer = await fs.readFile(
      path.join(fontDir, "IRANSansWeb(FaNum).ttf"),
    );
    const boldFontBuffer = await fs.readFile(
      path.join(fontDir, "IRANSansWeb(FaNum)_Bold.ttf"),
    );

    const regularFont = `data:font/ttf;base64,${regularFontBuffer.toString("base64")}`;
    const boldFont = `data:font/ttf;base64,${boldFontBuffer.toString("base64")}`;

    // ۳. ساخت PDF
    const pdfBuffer = await renderToBuffer(
      DisciplinaryReportPdf({
        data: res.data,
        regularFont,
        boldFont,
      }),
    );

    // ۴. بازگرداندن فایل
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="disciplinary-report-${enrollmentId}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("PDF_ERROR", error);
    return new Response(JSON.stringify({ error: "خطا در ساخت PDF" }), {
      status: 500,
    });
  }
}
