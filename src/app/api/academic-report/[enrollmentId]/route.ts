import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import path from "path";
import fs from "fs/promises";
import { AcademicReportPdf } from "@/lib/pdf/AcademicReportPdf";
import { getAcademicReportData } from "@/actions/academicReportActions";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> },
) {
  try {
    const { enrollmentId } = await params;
    const periodId = req.nextUrl.searchParams.get("periodId");

    if (!periodId) {
      return new Response(
        JSON.stringify({ error: "شناسه دوره ارسال نشده است" }),
        { status: 400 },
      );
    }

    const res = await getAcademicReportData(enrollmentId, periodId);
    if (res.status === "error") {
      return new Response(JSON.stringify({ error: res.error }), {
        status: 400,
      });
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

    const regularFont = `data:font/ttf;base64,${regularFontBuffer.toString("base64")}`;
    const boldFont = `data:font/ttf;base64,${boldFontBuffer.toString("base64")}`;

    const pdfBuffer = await renderToBuffer(
      AcademicReportPdf({ data: res.data, regularFont, boldFont }),
    );

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="academic-report-${enrollmentId}.pdf"`,
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
