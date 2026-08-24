import { getSchools } from "@/actions/schoolActions";
import SchoolComp from "./SchoolComp";
import { PAGE_SIZE } from "@/lib/schemas/env";
import { Props } from "@/types/myTypes";

export default async function ListSchoolPage({ searchParams }: Props) {
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const sortField = params.sortField;
  const sortOrder = (params.sortOrder as "asc" | "desc") || "asc";
  const searchField = params.searchField;
  const searchValue = params.searchValue;

  const data = await getSchools(page, PAGE_SIZE, {
    sortField,
    sortOrder,
    searchField,
    searchValue,
  });

  return (
    <SchoolComp
      listItems={data.items}
      totalCount={data.total}
      pageSize={PAGE_SIZE}
    />
  );
}
