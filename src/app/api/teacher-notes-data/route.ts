import { NextRequest, NextResponse } from "next/server";
import { getAttendanceSheets } from "@/actions/attendanceActions";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const selections = body?.selections ?? [];

    if (selections.length === 0) {
      return NextResponse.json(
        { error: "هیچ درسی انتخاب نشده" },
        { status: 400 },
      );
    }

    const res = await getAttendanceSheets(selections);
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
