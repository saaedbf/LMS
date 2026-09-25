import { getTeacherAbsences } from "@/actions/teacherAbsenceActions";
import { PAGE_SIZE } from "@/lib/schemas/env";
import { Props } from "@/types/myTypes";
import TeacherAbsenceComp from "./TeacherAbsenceComp";

export default async function TeacherAbsencePage({ searchParams }: Props) {
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const sortField = params.sortField;
  const sortOrder = (params.sortOrder as "asc" | "desc") || "desc";
  const searchField = params.searchField;
  const searchValue = params.searchValue;

  const data = await getTeacherAbsences(page, PAGE_SIZE, {
    sortField,
    sortOrder,
    searchField,
    searchValue,
  });

  return (
    <TeacherAbsenceComp
      listItems={data.items as any}
      totalCount={data.total}
      pageSize={PAGE_SIZE}
    />
  );
}
