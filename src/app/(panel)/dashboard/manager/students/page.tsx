import { prisma } from "@/lib/prisma";
import { getStudents } from "@/actions/studentActions";
import { getCurrentContext } from "@/actions/authActions";
import { PAGE_SIZE } from "@/lib/schemas/env";
import { Props } from "@/types/myTypes";
import StudentComp from "./StudentComp";

export default async function ListStudentPage({ searchParams }: Props) {
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
    throw new Error("شما دسترسی لازم برای مدیریت دانش‌آموزان را ندارید.");
  }

  const schoolId = context.schoolId;
  const academicYearId = context.academicYearId;

  const [data, school, klasses] = await Promise.all([
    getStudents(page, PAGE_SIZE, {
      sortField,
      sortOrder,
      searchField,
      searchValue,
    }),

    /**
     * مدرسه فعال مدیر به همراه دوره تحصیلی آن خوانده می‌شود.
     * سپس پایه‌ها و رشته‌ها فقط از همان دوره تحصیلی دریافت می‌شوند.
     */
    prisma.school.findUnique({
      where: {
        id: schoolId,
      },
      select: {
        id: true,
        title: true,
        doreTahsiliId: true,
        oppositeSchoolId: true, // ⬅️ این را اضافه کن
        doreTahsili: {
          select: {
            payes: {
              select: {
                id: true,
                title: true,
              },
              orderBy: {
                title: "asc",
              },
            },
            reshtehTahsilis: {
              select: {
                id: true,
                title: true,
              },
              orderBy: {
                title: "asc",
              },
            },
          },
        },
      },
    }),

    /**
     * فقط کلاس‌های مدرسه و سال تحصیلی فعال مدیر دریافت می‌شوند.
     * فیلتر تکمیلی پایه و رشته در فرم کلاینت انجام می‌شود.
     */
    prisma.klass.findMany({
      where: {
        schoolId,
        academicYearId,
      },
      select: {
        id: true,
        title: true,
        schoolId: true,
        academicYearId: true,
        payeId: true,
        reshtehTahsiliId: true,
      },
      orderBy: {
        title: "asc",
      },
    }),
  ]);

  if (!school) {
    throw new Error("مدرسهٔ فعال مدیر یافت نشد.");
  }

  if (!school.doreTahsili) {
    throw new Error(
      "برای مدرسهٔ فعال، دوره تحصیلی تعریف نشده است. ابتدا دوره تحصیلی مدرسه را مشخص کنید.",
    );
  }

  return (
    <StudentComp
      listItems={data.items}
      totalCount={data.total}
      pageSize={PAGE_SIZE}
      schoolId={schoolId}
      academicYearId={academicYearId}
      hasOppositeSchool={!!school.oppositeSchoolId} // ⬅️ این را بده
      payes={school.doreTahsili.payes.map((item) => ({
        value: item.id,
        label: item.title,
      }))}
      reshtehTahsilis={school.doreTahsili.reshtehTahsilis.map((item) => ({
        value: item.id,
        label: item.title,
      }))}
      klasses={klasses.map((item) => ({
        value: item.id,
        label: item.title,
        schoolId: item.schoolId,
        academicYearId: item.academicYearId,
        payeId: item.payeId,
        reshtehTahsiliId: item.reshtehTahsiliId,
      }))}
    />
  );
}
