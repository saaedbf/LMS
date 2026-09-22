// app/dashboard/teacher/page.tsx
import { getTeacherSchools } from "@/actions/teacherPanelActions";
import Link from "next/link";
import { School, GraduationCap, ChevronLeft } from "lucide-react";

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
            <Link
              key={school.schoolId}
              href={`/teacher/${school.schoolId}/periods`}
              className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <School size={24} />
                </div>
                <ChevronLeft
                  size={20}
                  className="text-zinc-400 transition-transform group-hover:-translate-x-1"
                />
              </div>

              <h3 className="mt-3 text-base font-bold text-zinc-800">
                {school.schoolTitle}
              </h3>

              {school.schoolSubTitle && (
                <p className="mt-1 text-xs text-zinc-500">
                  {school.schoolSubTitle}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-1.5">
                {school.academicYears.map((year: any) => (
                  <span
                    key={year.id}
                    className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                      year.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {year.title}
                    {year.isActive && " (جاری)"}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-1 text-[11px] text-zinc-400">
                <GraduationCap size={12} />
                <span>
                  {school.schoolSex === "Boy"
                    ? "پسرانه"
                    : school.schoolSex === "Girl"
                      ? "دخترانه"
                      : "مختلط"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
