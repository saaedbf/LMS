import DoreTahsiliComp from "./DoreTahsiliComp";
import { getDoreTahsilis } from "@/actions/dorehTahsiliActions";
import { PAGE_SIZE } from "@/lib/schemas/env";
import { Props } from "@/types/myTypes";

export default async function ListDorehTahsiliPage({ searchParams }: Props) {
  const page = Number(searchParams.page) || 1;
  const sortField = searchParams.sortField;
  const sortOrder = searchParams.sortOrder as "asc" | "desc";
  const searchField = searchParams.searchField;
  const searchValue = searchParams.searchValue;

  const data = await getDoreTahsilis(page, PAGE_SIZE, {
    sortField,
    sortOrder,
    searchField,
    searchValue,
  });

  return (
    <DoreTahsiliComp
      listItems={data.items}
      totalCount={data.total}
      pageSize={PAGE_SIZE}
    />
  );
}
