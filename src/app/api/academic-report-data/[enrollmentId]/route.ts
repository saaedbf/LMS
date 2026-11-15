import { NextRequest, NextResponse } from "next/server";
import { getAcademicReportData } from "@/actions/academicReportActions";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> },
) {
  try {
    const { enrollmentId } = await params;
    const periodId = req.nextUrl.searchParams.get("periodId");

    if (!enrollmentId) {
      return NextResponse.json(
        { error: "شناسه ثبت‌نام الزامی است" },
        { status: 400 },
      );
    }
    if (!periodId) {
      return NextResponse.json(
        { error: "شناسه دوره الزامی است" },
        { status: 400 },
      );
    }

    const res = await getAcademicReportData(enrollmentId, periodId);
    if (res.status === "error") {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({ data: res.data });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e.message || "خطا در دریافت داده" },
      { status: 500 },
    );
  }
}
