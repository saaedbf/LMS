import SearchInput from "./SearchInput";
import Pagination from "./Pagination";

type Props = {
  totalCount: number;
  pageSize?: number;
  children: React.ReactNode;
  action?: React.ReactNode;
};

export default function DataTableLayout({
  totalCount,
  pageSize = 10,
  children,
  action,
}: Props) {
  return (
    <div className="p-2">
      <div className="flex justify-between mb-4 gap-4">{action}</div>

      {children}

      <Pagination totalCount={totalCount} pageSize={pageSize} />
    </div>
  );
}
