import { getEncouragement } from "@/actions/encouragementActions";
import { getDisiplinaryFilterOptions } from "@/actions/disciplinaryActions";
import { PAGE_SIZE } from "@/lib/schemas/env";
import { Props } from "@/types/myTypes";
import EncouragementComp from "./EncouragementComp";

export default async function ListEncouragementPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const sortField = params.sortField;
  const sortOrder = (params.sortOrder as "asc" | "desc") || "desc";
  const searchField = params.searchField;
  const searchValue = params.searchValue;

  const [data, filterOptions] = await Promise.all([
    getEncouragement(page, PAGE_SIZE, {
      sortField,
      sortOrder,
      searchField,
      searchValue,
    }),
    getDisiplinaryFilterOptions(),
  ]);

  return (
    <EncouragementComp
      listItems={data.items}
      totalCount={data.total}
      pageSize={PAGE_SIZE}
      payes={filterOptions.payes || []}
      klasses={filterOptions.klasses || []}
    />
  );
}
