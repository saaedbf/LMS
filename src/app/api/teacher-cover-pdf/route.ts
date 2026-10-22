import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { TeacherCoverPdfDocument } from "@/lib/pdf/TeacherCoverPdfDocument";
import { getTeacherCoverSheets } from "@/actions/attendanceActions";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const res = await getTeacherCoverSheets();

    if (res.status === "error") {
      return new Response(JSON.stringify({ error: res.error }), {
        status: 400,
      });
    }

    if (res.data.length === 0) {
      return new Response(
        JSON.stringify({ error: "هیچ دبیری با درس در این مدرسه یافت نشد" }),
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

    const regularFont = `data:font/ttf;base64,${regularFontBuffer.toString("base64")}`;
    const boldFont = `data:font/ttf;base64,${boldFontBuffer.toString("base64")}`;

    const pdfBuffer = await renderToBuffer(
      TeacherCoverPdfDocument({
        teachers: res.data,
        regularFont,
        boldFont,
      }),
    );

    const pdf = new Uint8Array(pdfBuffer);

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="teacher-covers-${Date.now()}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("TEACHER_COVER_PDF_ERROR", error);
    return new Response(
      JSON.stringify({ error: `خطا: ${error?.message || "نامشخص"}` }),
      { status: 500 },
    );
  }
}
