import { getAbsences, getAbsenceFilterOptions } from "@/actions/absenceActions";
import { PAGE_SIZE } from "@/lib/schemas/env";
import { Props } from "@/types/myTypes";
import AbsenceComp from "./AbsenceComp";

export default async function ListAbsencePage({ searchParams }: Props) {
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const sortField = params.sortField;
  const sortOrder = (params.sortOrder as "asc" | "desc") || "desc";
  const searchField = params.searchField;
  const searchValue = params.searchValue;

  const [data, filterOptions] = await Promise.all([
    getAbsences(page, PAGE_SIZE, {
      sortField,
      sortOrder,
      searchField,
      searchValue,
    }),
    getAbsenceFilterOptions(),
  ]);

  return (
    <AbsenceComp
      listItems={data.items}
      totalCount={data.total}
      pageSize={PAGE_SIZE}
      payes={filterOptions.payes || []}
      klasses={filterOptions.klasses || []}
    />
  );
}
