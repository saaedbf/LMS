// src/app/api/manager-report-data/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getBulkAcademicReports } from "@/actions/academicReportActions";
import { getDetailedReportData } from "@/actions/reportActions";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const periodId = searchParams.get("periodId");
    const klassId = searchParams.get("klassId");
    const includeAnswerKey = searchParams.get("includeAnswerKey") !== "false";

    if (!type || !periodId || !klassId) {
      return NextResponse.json(
        { error: "پارامترهای لازم ارسال نشده" },
        { status: 400 },
      );
    }

    if (type === "academic") {
      const res = await getBulkAcademicReports(periodId, klassId, {
        includeAnswerKey,
      });
      if (res.status === "error") {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json({ data: res.data });
    }

    if (type === "detailed") {
      const data = await getDetailedReportData(periodId, klassId);
      if (!data || data.students.length === 0) {
        return NextResponse.json(
          { error: "داده‌ای برای گزارش تفضیلی وجود ندارد" },
          { status: 404 },
        );
      }
      return NextResponse.json({ data });
    }

    return NextResponse.json(
      { error: "نوع گزارش نامعتبر است" },
      { status: 400 },
    );
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e.message || "خطا در دریافت داده" },
      { status: 500 },
    );
  }
}
