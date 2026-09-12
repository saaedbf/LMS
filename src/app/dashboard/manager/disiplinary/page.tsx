import {
  getDisciplinary,
  getDisiplinaryFilterOptions,
} from "@/actions/disciplinaryActions";
import { PAGE_SIZE } from "@/lib/schemas/env";
import { Props } from "@/types/myTypes";
import AbsenceComp from "./DisiplinaryComp";
import DisiplinaryComp from "./DisiplinaryComp";

export default async function ListDisiplinaryPage({ searchParams }: Props) {
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const sortField = params.sortField;
  const sortOrder = (params.sortOrder as "asc" | "desc") || "desc";
  const searchField = params.searchField;
  const searchValue = params.searchValue;

  const [data, filterOptions] = await Promise.all([
    getDisciplinary(page, PAGE_SIZE, {
      sortField,
      sortOrder,
      searchField,
      searchValue,
    }),
    getDisiplinaryFilterOptions(),
  ]);

  return (
    <DisiplinaryComp
      listItems={data.items}
      totalCount={data.total}
      pageSize={PAGE_SIZE}
      payes={filterOptions.payes || []}
      klasses={filterOptions.klasses || []}
    />
  );
}
