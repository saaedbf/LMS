import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PAGE_SIZE } from "@/lib/schemas/env";
import ManageKlassesForm from "./ManageKlassesForm";
import { getSchoolKlasses, getSchoolDoreOptions } from "@/actions/klassActions";
import { Props } from "@/types/myTypes";
import { GraduationCap } from "lucide-react";

interface PageProps extends Props {}

export default async function ManageKlassesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  // 1. دریافت سال تحصیلی فعال سیستم (یا آخرین سال فعال ثبت‌شده)
  const activeYear = await prisma.academicYear.findFirst({
    where: { isActive: true },
    orderBy: { id: "desc" },
  });
  if (!activeYear)
    return (
      <div className="p-8 text-center text-red-500">
        سال تحصیلی فعالی در سیستم تعریف نشده است.
      </div>
    );

  // 2. مشخص کردن مدرسه مدیر جاری
  // نکته: اینجا شناسه مدرسه به عنوان مثال دریافت می‌شود. شما باید آن را از Session کاربر لاگین شده استخراج کنید.
  // به عنوان مثال: const schoolId = user.assignment.schoolId
  const activeSchool = await prisma.school.findFirst({
    where: { isActive: true },
  });
  if (!activeSchool) return notFound();

  const schoolId = activeSchool.id;

  // 3. دریافت پایه‌ها و رشته‌های مجاز برای دوره تحصیلی این مدرسه
  const { payes, reshtehs } = await getSchoolDoreOptions(schoolId);

  // 4. پارامترهای جدول داده
  const page = Number(resolvedSearchParams.page) || 1;
  const sortField = resolvedSearchParams.sortField;
  const sortOrder = (resolvedSearchParams.sortOrder as "asc" | "desc") || "asc";
  const searchField = resolvedSearchParams.searchField;
  const searchValue = resolvedSearchParams.searchValue;

  // 5. واکشی داده‌های جدول کلاس‌ها
  const klassesData = await getSchoolKlasses(
    schoolId,
    activeYear.id,
    page,
    PAGE_SIZE,
    {
      sortField,
      sortOrder,
      searchField,
      searchValue,
    },
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
            <GraduationCap size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              مدیریت کلاس‌های مدرسه
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              مدرسه:{" "}
              <span className="font-semibold text-gray-700">
                {activeSchool.title}
              </span>{" "}
              | سال تحصیلی:{" "}
              <span className="font-semibold text-indigo-600">
                {activeYear.title}
              </span>
            </p>
          </div>
        </div>
      </div>

      <ManageKlassesForm
        schoolId={schoolId}
        academicYearId={activeYear.id}
        payes={payes}
        reshtehs={reshtehs}
        klasses={klassesData.items}
        totalCount={klassesData.total}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
