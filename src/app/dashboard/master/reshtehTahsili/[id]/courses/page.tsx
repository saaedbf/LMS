import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, BookOpen } from "lucide-react";
import { notFound } from "next/navigation";
import { PAGE_SIZE } from "@/lib/schemas/env";
import ManageReshtehCoursesForm from "./ManageReshtehCoursesForm";
import { getAssignedDars } from "@/actions/darsPayeReshtehActions";
import { Props } from "@/types/myTypes";

interface PageProps extends Props {
  params: Promise<{ id: string }>;
}

export default async function ManageReshtehCoursesPage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const reshtehId = Number(resolvedParams.id);
  if (isNaN(reshtehId)) return notFound();

  // پیدا کردن رشته تحصیلی
  const reshteh = await prisma.reshtehTahsili.findUnique({
    where: { id: reshtehId },
  });
  if (!reshteh) return notFound();

  // گرفتن پایه‌های تحصیلی سیستم برای نمایش در فیلتر انتخابی فرم ثبت
  const payes = await prisma.paye.findMany({
    orderBy: { id: "asc" },
  });

  const page = Number(resolvedSearchParams.page) || 1;
  const sortField = resolvedSearchParams.sortField;
  const sortOrder = (resolvedSearchParams.sortOrder as "asc" | "desc") || "asc";
  const searchField = resolvedSearchParams.searchField;
  const searchValue = resolvedSearchParams.searchValue;

  // واکشی دروس نسبت داده شده بر اساس ساختار DataTable
  const assignedData = await getAssignedDars(reshtehId, page, PAGE_SIZE, {
    sortField,
    sortOrder,
    searchField,
    searchValue,
  });

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              مدیریت برنامه درسی رشته
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              تنظیم و تعداد واحد دروس مربوط به رشته:
              <span className="font-semibold text-indigo-600">
                {" "}
                {reshteh.title}
              </span>
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/master/reshtehTahsili"
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all text-sm font-medium w-fit"
        >
          بازگشت به لیست رشته‌ها
          <ChevronLeft size={18} />
        </Link>
      </div>

      <ManageReshtehCoursesForm
        reshtehId={reshtehId}
        payes={payes}
        assignedCourses={assignedData.items}
        totalCount={assignedData.total}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
