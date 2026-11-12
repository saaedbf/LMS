import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { WeeklyAttendanceCoverPdf } from "@/lib/pdf/WeeklyAttendanceCoverPdf";
import { getSchoolCoverInfo } from "@/actions/weeklyTeacherAttendanceActions";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(_req: NextRequest) {
  try {
    const res = await getSchoolCoverInfo();
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
      WeeklyAttendanceCoverPdf({
        data: res.data,
        regularFont,
        boldFont,
      }),
    );

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="weekly-cover-${Date.now()}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
