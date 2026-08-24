import { getReshteTahsilis } from "@/actions/reshtehTahsiliActions";
import ListComponent from "./ReshtehTahsiliComp";
import { PAGE_SIZE } from "@/lib/schemas/env"; // ← import
import { Props } from "@/types/myTypes";

export default async function ListReshTahsiliPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const sortField = params.sortField;
  const sortOrder = params.sortOrder as "asc" | "desc";
  const searchField = params.searchField;
  const searchValue = params.searchValue;

  const data = await getReshteTahsilis(page, PAGE_SIZE, {
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
