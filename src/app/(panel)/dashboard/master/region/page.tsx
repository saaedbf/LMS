// app/dashboard/manager/region/page.tsx
import { getRegions } from "@/actions/regionActions";
import ListComponent from "./regionComp";
import { PAGE_SIZE } from "@/lib/schemas/env"; // ← import
import { Props } from "@/types/myTypes";

export default async function ListRegionPage({ searchParams }: Props) {
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const sortField = params.sortField;
  const sortOrder = (params.sortOrder as "asc" | "desc") || "asc";
  const searchField = params.searchField;
  const searchValue = params.searchValue;

  const data = await getRegions(page, PAGE_SIZE, {
    sortField,
    sortOrder,
    searchField,
    searchValue,
  });

  return (
    <ListComponent
      listItems={data.items}
      totalCount={data.total}
      pageSize={PAGE_SIZE}
    />
  );
}
