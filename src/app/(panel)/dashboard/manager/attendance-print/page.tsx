import {
  getAttendanceTree,
  getTeachersForFilter,
} from "@/actions/attendanceActions";
import AttendancePrintComp from "./AttendancePrintComp";

export default async function AttendancePrintPage() {
  const [treeRes, teachersRes] = await Promise.all([
    getAttendanceTree(),
    getTeachersForFilter(),
  ]);

  if (treeRes.status === "error") {
    return <div className="p-6 text-center text-red-600">{treeRes.error}</div>;
  }

  if (teachersRes.status === "error") {
    return (
      <div className="p-6 text-center text-red-600">{teachersRes.error}</div>
    );
  }

  return (
    <AttendancePrintComp tree={treeRes.data} teachers={teachersRes.data} />
  );
}
