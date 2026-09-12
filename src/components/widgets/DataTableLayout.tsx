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
    <div className="space-y-4">
      {/* هدر با action - به حالت قبلی */}
      <div className="flex items-center justify-between gap-4 flex-row-reverse">
        <div className="flex-1">{/* SearchInput در صورت نیاز */}</div>
        <div className="flex-shrink-0 ">{action}</div>
      </div>

      {/* کانتینر جدول با اسکرول - فقط همین بخش تغییر کرده */}
      <div className="relative w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow dark:border-zinc-700 dark:bg-zinc-900">
        <div
          className="w-full overflow-auto"
          style={{ maxHeight: "calc(100vh - 320px)" }}
        >
          {children}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-500">تعداد کل: {totalCount}</span>
        <Pagination totalCount={totalCount} pageSize={pageSize} />
      </div>
    </div>
  );
}
