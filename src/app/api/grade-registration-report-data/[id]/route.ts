import { NextRequest, NextResponse } from "next/server";
import { getGradeRegistrationReport } from "@/actions/gradePeriodReportActions";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const res = await getGradeRegistrationReport(id);
    if (res.status === "error") {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    if (!res.data || res.data.length === 0) {
      return NextResponse.json(
        { error: "داده‌ای برای گزارش یافت نشد" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      data: res.data,
      meta: {
        periodTitle: res.meta?.periodTitle ?? "—",
        schoolTitle: res.meta?.schoolTitle ?? "—",
        academicYearTitle: res.meta?.academicYearTitle ?? "—",
      },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e.message || "خطا در دریافت داده" },
      { status: 500 },
    );
  }
}
