// app/(panel)/teacher/page.tsx
import { getTeacherSchools } from "@/actions/teacherPanelActions";
import SelectSchoolButton from "./SelectSchoolButton";

export default async function TeacherHomePage() {
  const res = await getTeacherSchools();

  if (res.status === "error") {
    return (
      <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">
        {res.error}
      </div>
    );
  }

  const schools = res.data;

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-l from-blue-600 to-blue-500 p-5 text-white shadow-lg">
        <h1 className="text-lg font-bold">مدارس من</h1>
        <p className="mt-1 text-sm text-blue-100">
          مدرسه‌ای که در آن تدریس می‌کنید را انتخاب کنید.
        </p>
      </div>

      {schools.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">
            شما در هیچ مدرسه‌ای تدریس نمی‌کنید.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {schools.map((school) => (
            <SelectSchoolButton
              key={school.schoolId}
              assignmentId={school.assignmentId}
              schoolId={school.schoolId}
              schoolTitle={school.schoolTitle}
              schoolSubTitle={school.schoolSubTitle}
              academicYears={school.academicYears}
              schoolSex={school.schoolSex}
            />
          ))}
        </div>
      )}
    </div>
  );
}
