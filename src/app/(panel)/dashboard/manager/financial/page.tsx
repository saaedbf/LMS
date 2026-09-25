import {
  getFinancialTransactions,
  getFinancialFilterOptions,
} from "@/actions/financialActions";
import { PAGE_SIZE } from "@/lib/schemas/env";
import { Props } from "@/types/myTypes";
import FinancialComp from "./FinancialComp";

export default async function FinancialPage({ searchParams }: Props) {
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const sortField = params.sortField;
  const sortOrder = (params.sortOrder as "asc" | "desc") || "desc";
  const searchField = params.searchField;
  const searchValue = params.searchValue;

  const [data, filterOptions] = await Promise.all([
    getFinancialTransactions(page, PAGE_SIZE, {
      sortField,
      sortOrder,
      searchField,
      searchValue,
    }),
    getFinancialFilterOptions(),
  ]);

  return (
    <FinancialComp
      listItems={data.items as any}
      totalCount={data.total}
      pageSize={PAGE_SIZE}
      payes={filterOptions.payes || []}
      klasses={filterOptions.klasses || []}
    />
  );
}
