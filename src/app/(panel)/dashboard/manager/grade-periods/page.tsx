// app/dashboard/manager/grade-periods/page.tsx
import { getGradePeriods } from "@/actions/gradePeriodActions";
import { PAGE_SIZE } from "@/lib/schemas/env";
import { Props } from "@/types/myTypes";
import GradePeriodComp from "./GradePeriodComp";

export default async function GradePeriodsPage({ searchParams }: Props) {
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const sortField = params.sortField;
  const sortOrder = (params.sortOrder as "asc" | "desc") || "desc";
  const searchField = params.searchField;
  const searchValue = params.searchValue;

  const data = await getGradePeriods({
    page,
    pageSize: PAGE_SIZE,
    sortField,
    sortOrder,
    searchField,
    searchValue,
  });

  return (
    <GradePeriodComp
      listItems={data.items}
      totalCount={data.total}
      pageSize={PAGE_SIZE}
    />
  );
}
