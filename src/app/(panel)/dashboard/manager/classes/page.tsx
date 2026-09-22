// app/dashboard/manager/classes/page.tsx
import { notFound } from "next/navigation";
import { PAGE_SIZE } from "@/lib/schemas/env";
import ManageKlassesForm from "./ManageKlassesForm";
import { getSchoolKlasses, getSchoolDoreOptions } from "@/actions/klassActions";
import { getCurrentContext } from "@/actions/authActions";
import { Props } from "@/types/myTypes";
import { GraduationCap } from "lucide-react";

interface PageProps extends Props {}

export default async function ManageKlassesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  // ⬅️ ۱. دریافت کانتکست فعال (مدرسه و سال تحصیلی جاری)
  const context = await getCurrentContext();

  if (!context) {
    notFound();
  }

  if (!context.schoolId || !context.academicYearId) {
    return (
      <div className="p-8 text-center text-red-500">
        کانتکست فعال مدرسه یافت نشد. لطفاً دوباره وارد شوید.
      </div>
    );
  }

  // ⬅️ ۲. فقط مدیر می‌تواند به این صفحه دسترسی داشته باشد
  if (context.role !== "MANAGER" && context.role !== "DEPUTY") {
    return (
      <div className="p-8 text-center text-red-500">
        شما دسترسی لازم برای مدیریت کلاس‌ها را ندارید.
      </div>
    );
  }

  const schoolId = context.schoolId;
  const academicYearId = context.academicYearId;

  // ⬅️ ۳. دریافت اطلاعات مدرسه از دیتابیس
  const { prisma } = await import("@/lib/prisma");

  const activeSchool = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { id: true, title: true },
  });

  if (!activeSchool) {
    return (
      <div className="p-8 text-center text-red-500">مدرسه فعال یافت نشد.</div>
    );
  }

  const activeYear = await prisma.academicYear.findUnique({
    where: { id: academicYearId },
    select: { id: true, title: true, isActive: true },
  });

  if (!activeYear) {
    return (
      <div className="p-8 text-center text-red-500">
        سال تحصیلی فعال یافت نشد.
      </div>
    );
  }

  // ⬅️ ۴. دریافت پایه‌ها و رشته‌های مجاز برای دوره تحصیلی این مدرسه
  const { payes, reshtehs } = await getSchoolDoreOptions(schoolId);

  // ⬅️ ۵. پارامترهای جدول داده
  const page = Number(resolvedSearchParams.page) || 1;
  const sortField = resolvedSearchParams.sortField;
  const sortOrder = (resolvedSearchParams.sortOrder as "asc" | "desc") || "asc";
  const searchField = resolvedSearchParams.searchField;
  const searchValue = resolvedSearchParams.searchValue;

  // ⬅️ ۶. واکشی داده‌های جدول کلاس‌ها
  const klassesData = await getSchoolKlasses(
    schoolId,
    academicYearId,
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
        academicYearId={academicYearId}
        payes={payes}
        reshtehs={reshtehs}
        klasses={klassesData.items}
        totalCount={klassesData.total}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
