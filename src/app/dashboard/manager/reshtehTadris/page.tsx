import { getReshteTadrises } from "@/actions/reshtehTadrisesActions";
import ListComponent from "./ReshtehTadrisComp";
import { Props } from "@/types/myTypes";
import { PAGE_SIZE } from "@/lib/schemas/env";

export default async function ListReshTadrisPage({ searchParams }: Props) {
  const page = Number(searchParams.page) || 1;
  const sortField = searchParams.sortField;
  const sortOrder = searchParams.sortOrder as "asc" | "desc";
  const searchField = searchParams.searchField;
  const searchValue = searchParams.searchValue;

  const data = await getReshteTadrises(page, PAGE_SIZE, {
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
