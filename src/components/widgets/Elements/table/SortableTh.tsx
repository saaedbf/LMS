"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FaSort, FaSortAmountDown, FaSortAmountDownAlt } from "react-icons/fa";

type Props = {
  field: string;
  children: React.ReactNode;
  sortable?: boolean;
};

export default function SortableTh({ field, children, sortable }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentField = searchParams.get("sortField");
  const currentOrder = searchParams.get("sortOrder");

  const handleSort = () => {
    const params = new URLSearchParams(searchParams.toString());

    let newOrder: "asc" | "desc" = "asc";

    if (currentField === field && currentOrder === "asc") {
      newOrder = "desc";
    }

    params.set("sortField", field);
    params.set("sortOrder", newOrder);
    params.set("page", "1");

    router.push(`?${params.toString()}`);
  };

  const arrow =
    currentField === field ? (
      currentOrder === "asc" ? (
        <FaSortAmountDownAlt />
      ) : (
        <FaSortAmountDown />
      )
    ) : (
      <FaSort />
    );

  return (
    <th className=" select-none px-8">
      <div className="flex items-center justify-between">
        {children}
        {sortable && (
          <button className="cursor-pointer" onClick={handleSort}>
            {arrow}
          </button>
        )}
      </div>
    </th>
  );
}
