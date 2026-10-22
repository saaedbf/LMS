// app/dashboard/manager/class-courses/page.tsx
import { getClassCoursesWithJoin } from "@/actions/classCourseActions";
import { PAGE_SIZE } from "@/lib/schemas/env";
import { Props } from "@/types/myTypes";
import ClassCourseComp from "./ClassCourseComp";
import { getSchoolSettings } from "@/actions/schoolSettingsActions";
export default async function ClassCoursesPage({ searchParams }: Props) {
  const params = await searchParams;
  const settingsRes = await getSchoolSettings();
  const bellCount =
    settingsRes.status === "success" ? settingsRes.data.dailyBellCount : 3;
  const page = Number(params.page) || 1;
  const sortField = params.sortField;
  const sortOrder = (params.sortOrder as "asc" | "desc") || "desc";
  const searchField = params.searchField;
  const searchValue = params.searchValue;

  const data = await getClassCoursesWithJoin({
    page,
    pageSize: PAGE_SIZE,
    sortField,
    sortOrder,
    searchField,
    searchValue,
  });

  return (
    <ClassCourseComp
      listItems={data.items}
      totalCount={data.total}
      pageSize={PAGE_SIZE}
      initialBellCount={bellCount} // ⬅️ پاس دادن مقدار
    />
  );
}
