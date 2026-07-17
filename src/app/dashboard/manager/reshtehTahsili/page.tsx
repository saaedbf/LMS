import { getReshteTahsilis } from "@/actions/reshtehTahsiliActions";
import ListComponent from "./ReshtehTahsiliComp";
import { PAGE_SIZE } from "@/lib/schemas/env"; // ← import
import { Props } from "@/types/myTypes";

export default async function ListReshTahsiliPage({ searchParams }: Props) {
  const page = Number(searchParams.page) || 1;
  const sortField = searchParams.sortField;
  const sortOrder = searchParams.sortOrder as "asc" | "desc";
  const searchField = searchParams.searchField;
  const searchValue = searchParams.searchValue;

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
