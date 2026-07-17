export type Props = {
  searchParams: {
    page?: string;
    sortOrder?: string;
    sortField?: string;
    searchField?: string;
    searchValue?: string;
  };
};
export type ListProps<T> = {
  listItems: T[];
  totalCount: number;
  pageSize: number;
};
export type ListOptions = {
  sortField?: string;
  sortOrder?: "asc" | "desc";
  searchField?: string;
  searchValue?: string;
};
