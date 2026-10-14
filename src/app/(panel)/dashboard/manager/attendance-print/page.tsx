import { getAttendanceTree } from "@/actions/attendanceActions";
import AttendancePrintComp from "./AttendancePrintComp";

export default async function AttendancePrintPage() {
  const res = await getAttendanceTree();

  if (res.status === "error") {
    return <div className="p-6 text-center text-red-600">{res.error}</div>;
  }

  return <AttendancePrintComp tree={res.data} />;
}
