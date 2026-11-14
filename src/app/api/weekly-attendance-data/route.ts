import { NextRequest, NextResponse } from "next/server";
import { getWeeklyTeacherAttendance } from "@/actions/weeklyTeacherAttendanceActions";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const weekStart: string | undefined = body?.weekStart;

    const res = await getWeeklyTeacherAttendance({ weekStart });
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
