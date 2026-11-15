import { NextRequest, NextResponse } from "next/server";
import { getSchoolCoverInfo } from "@/actions/weeklyTeacherAttendanceActions";

export const runtime = "nodejs";

export async function POST(_req: NextRequest) {
  try {
    const res = await getSchoolCoverInfo();
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
