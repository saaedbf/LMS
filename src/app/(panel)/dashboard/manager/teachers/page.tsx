import { prisma } from "@/lib/prisma";
import { getTeachers } from "@/actions/teacherActions";
import { getCurrentContext } from "@/actions/authActions";
import { PAGE_SIZE } from "@/lib/schemas/env";
import { Props } from "@/types/myTypes";
import TeacherComp from "./TeacherComp";

export default async function ListTeacherPage({ searchParams }: Props) {
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const sortField = params.sortField;
  const sortOrder = (params.sortOrder as "asc" | "desc") || "desc";
  const searchField = params.searchField;
  const searchValue = params.searchValue;

  /**
   * کانتکست فعال از Session و UserAssignment فعال گرفته می‌شود.
   * schoolId و academicYearId نباید از searchParams یا فرم دریافت شوند.
   */
  const context = await getCurrentContext();

  if (!context?.schoolId || !context.academicYearId) {
    throw new Error(
      "کانتکست فعال مدرسه یا سال تحصیلی یافت نشد. ابتدا کانتکست فعال خود را انتخاب کنید.",
    );
  }

  if (context.role !== "MANAGER") {
    throw new Error("شما دسترسی لازم برای مدیریت معلمان را ندارید.");
  }

  const schoolId = context.schoolId;
  const academicYearId = context.academicYearId;

  const [data, school] = await Promise.all([
    getTeachers(page, PAGE_SIZE, {
      sortField,
      sortOrder,
      searchField,
      searchValue,
    }),

    /**
     * مدرسه فعال مدیر خوانده می‌شود.
     */
    prisma.school.findUnique({
      where: {
        id: schoolId,
      },
      select: {
        id: true,
        title: true,
      },
    }),
  ]);

  if (!school) {
    throw new Error("مدرسهٔ فعال مدیر یافت نشد.");
  }

  return (
    <TeacherComp
      listItems={data.items as any}
      totalCount={data.total}
      pageSize={PAGE_SIZE}
      schoolId={schoolId}
      academicYearId={academicYearId}
    />
  );
}
