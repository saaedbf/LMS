import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import path from "path";
import fs from "fs/promises";
import {
  getAcademicReportData,
  getBulkAcademicReports,
} from "@/actions/academicReportActions";
import { getDetailedReportData } from "@/actions/reportActions";
import { DetailedReportPdf } from "@/lib/pdf/DetailedReportPdf";
import {
  AcademicReportPdf,
  MultiAcademicReportPdf,
} from "@/lib/pdf/AcademicReportPdf";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "academic" | "detailed"
    const periodId = searchParams.get("periodId");
    const klassId = searchParams.get("klassId");
    // ⬅️ خواندن includeAnswerKey (پیش‌فرض true)
    const includeAnswerKey = searchParams.get("includeAnswerKey") !== "false";

    if (!type || !periodId || !klassId) {
      return new NextResponse("پارامترها ناقص هستند", { status: 400 });
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

    if (type === "academic") {
      // ⬅️ پاس دادن includeAnswerKey به اکشن
      const res = await getBulkAcademicReports(periodId, klassId, {
        includeAnswerKey,
      });

      if (res.status === "error") {
        return new NextResponse(res.error, { status: 400 });
      }

      if (res.data.length === 0) {
        return new NextResponse("دانش‌آموزی برای کارنامه یافت نشد", {
          status: 404,
        });
      }

      const pdfBuffer = await renderToBuffer(
        MultiAcademicReportPdf({ dataList: res.data, regularFont, boldFont }),
      );

      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="academic-${klassId}.pdf"`,
        },
      });
    }

    if (type === "detailed") {
      const data = await getDetailedReportData(periodId, klassId);
      if (!data || data.students.length === 0) {
        return new NextResponse("داده‌ای برای گزارش تفضیلی وجود ندارد", {
          status: 404,
        });
      }
      const pdfBuffer = await renderToBuffer(
        DetailedReportPdf({ data, regularFont, boldFont }),
      );
      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="detailed-${klassId}.pdf"`,
        },
      });
    }

    return new NextResponse("نوع گزارش نامعتبر است", { status: 400 });
  } catch (error) {
    console.error(error);
    return new NextResponse("خطا در ساخت PDF", { status: 500 });
  }
}

// تابع کمکی برای گرفتن IDهای ثبت‌نام کلاس
async function getKlassEnrollmentIds(klassId: string) {
  const { prisma } = await import("@/lib/prisma");
  const enrollments = await prisma.studentEnrollment.findMany({
    where: { klassId },
    select: { id: true },
    orderBy: { student: { lastName: "asc" } },
  });
  return enrollments.map((e) => e.id);
}
