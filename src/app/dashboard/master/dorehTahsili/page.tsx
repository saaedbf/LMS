import DoreTahsiliComp from "./DoreTahsiliComp";
import { getDoreTahsilis } from "@/actions/dorehTahsiliActions";
import { PAGE_SIZE } from "@/lib/schemas/env";
import { Props } from "@/types/myTypes";

export default async function ListDorehTahsiliPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const sortField = params.sortField;
  const sortOrder = params.sortOrder as "asc" | "desc";
  const searchField = params.searchField;
  const searchValue = params.searchValue;

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
