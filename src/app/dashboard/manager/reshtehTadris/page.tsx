import { getReshteTadrises } from "@/actions/reshtehTadrisesActions";
import ListComponent from "./ReshtehTadrisComp";
import { Props } from "@/types/myTypes";
import { PAGE_SIZE } from "@/lib/schemas/env";

export default async function ListReshTadrisPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const sortField = params.sortField;
  const sortOrder = params.sortOrder as "asc" | "desc";
  const searchField = params.searchField;
  const searchValue = params.searchValue;

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
