import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import path from "path";
import fs from "fs/promises";

import { GradeRegistrationReportPdf } from "@/lib/pdf/GradeRegistrationReportPdf";
import { getGradeRegistrationReport } from "@/actions/gradePeriodReportActions";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const res = await getGradeRegistrationReport(id);
    if (res.status === "error") {
      return new Response(JSON.stringify({ error: res.error }), {
        status: 400,
      });
    }

    if (!res.data || res.data.length === 0) {
      return new Response(
        JSON.stringify({ error: "داده‌ای برای گزارش یافت نشد" }),
        { status: 400 },
      );
    }

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

    const regularFont = `data:font/ttf;base64,${regularFontBuffer.toString(
      "base64",
    )}`;
    const boldFont = `data:font/ttf;base64,${boldFontBuffer.toString(
      "base64",
    )}`;

    const pdfBuffer = await renderToBuffer(
      GradeRegistrationReportPdf({
        rows: res.data,
        // ⬇️ از meta — دیگه "—" نیست
        periodTitle: res.meta?.periodTitle ?? "—",
        schoolTitle: res.meta?.schoolTitle ?? "—",
        academicYearTitle: res.meta?.academicYearTitle ?? "—",
        regularFont,
        boldFont,
      }),
    );

    const pdf = new Uint8Array(pdfBuffer);

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="grade-report-${Date.now()}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("PDF_ERROR", error);
    return new Response(
      JSON.stringify({ error: `خطا: ${error?.message || "نامشخص"}` }),
      { status: 500 },
    );
  }
}
