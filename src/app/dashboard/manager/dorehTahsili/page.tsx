import DoreTahsiliComp from "./DoreTahsiliComp";
import { getDoreTahsilis } from "@/actions/dorehTahsiliActions";

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

export default async function ListDorehTahsiliPage({ searchParams }: Props) {
  const page = Number(searchParams.page) || 1;
  const sortField = searchParams.sortField;
  const sortOrder = searchParams.sortOrder as "asc" | "desc";
  const searchField = searchParams.searchField;
  const searchValue = searchParams.searchValue;

  const data = await getDoreTahsilis(page, 2, {
    sortField,
    sortOrder,
    searchField,
    searchValue,
  });

  return (
    <DoreTahsiliComp
      doreTahisilis={data.items}
      totalCount={data.total}
      currentPage={page}
      search={searchValue || ""}
    />
  );
}
