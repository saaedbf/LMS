export type ColumnConfig<TField extends string> = {
  field: TField;
  type: "string" | "number";
  searchable?: boolean;
  sortable?: boolean;
};
export function buildSafeWhere<TField extends string>(
  columns: readonly ColumnConfig<TField>[],
  searchField?: string,
  searchValue?: string,
) {
  if (!searchField || !searchValue) return {};

  const column = columns.find((c) => c.field === searchField && c.searchable);

  if (!column) return {};

  if (column.type === "number") {
    const num = Number(searchValue);
    if (isNaN(num)) return {};
    return { [column.field]: num };
  }

  if (column.type === "string") {
    return {
      [column.field]: {
        contains: searchValue,
        mode: "insensitive",
      },
    };
  }

  return {};
}
export function buildOrderBy<TField extends string>(
  columns: readonly ColumnConfig<TField>[],
  sortField?: string,
  sortOrder?: "asc" | "desc",
) {
  const column = columns.find((c) => c.field === sortField && c.sortable);

  if (!column) return { id: "desc" };

  return {
    [column.field]: sortOrder === "desc" ? "desc" : "asc",
  };
}
