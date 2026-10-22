import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { TeacherNotesPdfDocument } from "@/lib/pdf/TeacherNotesPdfDocument";
import { getAttendanceSheets } from "@/actions/attendanceActions";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const selections = body.selections || [];

    if (selections.length === 0) {
      return new Response(JSON.stringify({ error: "هیچ درسی انتخاب نشده" }), {
        status: 400,
      });
    }

    const res = await getAttendanceSheets(selections);
    if (res.status === "error")
      return new Response(JSON.stringify({ error: res.error }), {
        status: 400,
      });

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
      TeacherNotesPdfDocument({ sheets: res.data, regularFont, boldFont }),
    );

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="notes-${Date.now()}.pdf"`,
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
