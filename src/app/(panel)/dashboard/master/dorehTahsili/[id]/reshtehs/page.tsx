import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, GraduationCap } from "lucide-react";
import { notFound } from "next/navigation";
import { PAGE_SIZE } from "@/lib/schemas/env";
import ManageDorehReshtehsForm from "./ManageDorehReshtehsForm";
import {
  getAssignedReshtehs,
  getAvailableReshtehs,
} from "@/actions/dorehReshtehActions";
import { Props } from "@/types/myTypes";
import BackButton from "@/components/widgets/Elements/BackButton";

interface PageProps extends Props {
  params: Promise<{ id: string }>;
}

export default async function ManageDorehReshtehsPage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const dorehId = Number(resolvedParams.id);
  if (isNaN(dorehId)) return notFound();

  const doreh = await prisma.doreTahsili.findUnique({
    where: { id: dorehId },
  });

  if (!doreh) return notFound();

  const page = Number(resolvedSearchParams.page) || 1;
  const sortField = resolvedSearchParams.sortField;
  const sortOrder = (resolvedSearchParams.sortOrder as "asc" | "desc") || "asc";
  const searchField = resolvedSearchParams.searchField;
  const searchValue = resolvedSearchParams.searchValue;
  const selectSearch =
    typeof resolvedSearchParams.selectSearch === "string"
      ? resolvedSearchParams.selectSearch
      : "";

  const [assignedReshtehs, availableReshtehs] = await Promise.all([
    getAssignedReshtehs(dorehId, page, PAGE_SIZE, {
      sortField,
      sortOrder,
      searchField,
      searchValue,
    }),
    getAvailableReshtehs(dorehId, selectSearch),
  ]);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
            <GraduationCap size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              مدیریت رشته‌های تحصیلی
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              تنظیم رشته‌های زیرمجموعه دوره:
              <span className="font-semibold text-blue-600">
                {" "}
                {doreh.title}
              </span>
            </p>
          </div>
        </div>

        <BackButton
          href="/dashboard/master/dorehTahsili"
          label=" بازگشت به لیست دوره‌ها    "
          className="mb-3"
        />
      </div>

      <ManageDorehReshtehsForm
        dorehId={dorehId}
        assignedReshtehs={assignedReshtehs.items}
        totalCount={assignedReshtehs.total}
        pageSize={PAGE_SIZE}
        availableReshtehs={availableReshtehs}
      />

      <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-lg text-amber-800 text-sm">
        حذف هر مورد فقط ارتباط رشته با این دوره را قطع می‌کند و خود رشته حذف
        نمی‌شود.
      </div>
    </div>
  );
}
