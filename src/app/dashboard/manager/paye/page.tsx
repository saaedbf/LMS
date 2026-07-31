import PayeComp from "./PayeComp";
import { getPayes } from "@/actions/payeActions";
import { PAGE_SIZE } from "@/lib/schemas/env";
import { Props } from "@/types/myTypes";

export default async function ListPayePage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const sortField = params.sortField;
  const sortOrder = params.sortOrder as "asc" | "desc";
  const searchField = params.searchField;
  const searchValue = params.searchValue;

  const data = await getPayes(page, PAGE_SIZE, {
    sortField,
    sortOrder,
    searchField,
    searchValue,
  });

  return (
    <PayeComp
      listItems={data.items}
      totalCount={data.total}
      pageSize={PAGE_SIZE}
    />
  );
}
