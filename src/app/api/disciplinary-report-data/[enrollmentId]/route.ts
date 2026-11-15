import { NextRequest, NextResponse } from "next/server";
import { getStudentDisciplinaryReport } from "@/actions/disciplinaryReportActions";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> },
) {
  try {
    const { enrollmentId } = await params;

    if (!enrollmentId) {
      return NextResponse.json(
        { error: "شناسه ثبت‌نام الزامی است" },
        { status: 400 },
      );
    }

    const res = await getStudentDisciplinaryReport(enrollmentId);
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
