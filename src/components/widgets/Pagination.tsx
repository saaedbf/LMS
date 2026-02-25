"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  totalCount: number;
  pageSize: number;
};

export default function Pagination({ totalCount, pageSize }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(totalCount / pageSize);

  const changePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  // تولید لیست صفحات
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center mt-6 gap-2 flex-wrap">
      <button
        disabled={currentPage === 1}
        onClick={() => changePage(currentPage - 1)}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        قبلی
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => changePage(page)}
          className={`px-3 py-1 rounded ${
            page === currentPage ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        disabled={currentPage === totalPages}
        onClick={() => changePage(currentPage + 1)}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        بعدی
      </button>
    </div>
  );
}
