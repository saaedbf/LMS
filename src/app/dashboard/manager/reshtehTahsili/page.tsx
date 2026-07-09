import { getReshteTahsilis } from "@/actions/reshtehTahsiliActions";
import ListComponent from "./ReshtehTahsiliComp";

type Props = {
  searchParams: {
    page?: string;
    search?: string;
    sortOrder?: string;
    sortField?: string;
    searchField?: string;
    searchValue?: string;
  };
};

export default async function ListReshTahsiliPage({ searchParams }: Props) {
  const page = Number(searchParams.page) || 1;
  const sortField = searchParams.sortField;
  const sortOrder = searchParams.sortOrder as "asc" | "desc";
  const searchField = searchParams.searchField;
  const searchValue = searchParams.searchValue;

  const data = await getReshteTahsilis(page, 2, {
    sortField,
    sortOrder,
    searchField,
    searchValue,
  });

  return (
    <ListComponent
      listItems={data.items}
      totalCount={data.total}
      currentPage={page}
      search={searchValue || ""}
    />
  );
}
