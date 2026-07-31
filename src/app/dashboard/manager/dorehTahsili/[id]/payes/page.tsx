import { prisma } from "@/lib/prisma";
import {
  getAssignedPayes,
  getAvailablePayes,
} from "@/actions/dorehPayeActions";
import ManageDorehPayesForm from "./ManageDorehPayesForm";
import Link from "next/link";
import { ChevronLeft, GraduationCap } from "lucide-react";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ManageDorehPayesPage({ params }: Props) {
  // ۱. انتظار برای دریافت پارامترهای آدرس (Next.js 15)
  const resolvedParams = await params;
  const dorehId = Number(resolvedParams.id);

  // ۲. اعتبارسنجی ID (اگر عدد نبود)
  if (isNaN(dorehId)) {
    return notFound();
  }

  // ۳. دریافت اطلاعات دوره برای نمایش در هدر
  const doreh = await prisma.doreTahsili.findUnique({
    where: { id: dorehId },
  });

  // اگر دوره‌ای با این ID وجود نداشت
  if (!doreh) {
    return notFound();
  }

  // ۴. دریافت همزمان لیست پایه‌های اختصاص داده شده و پایه‌های قابل انتخاب
  // استفاده از Promise.all برای افزایش سرعت لود صفحه
  const [assignedPayes, availablePayes] = await Promise.all([
    getAssignedPayes(dorehId),
    getAvailablePayes(dorehId),
  ]);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* هدر صفحه و ناوبری */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
            <GraduationCap size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              مدیریت پایه‌های تحصیلی
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              تنظیم پایه‌های زیرمجموعه دوره:{" "}
              <span className="font-semibold text-blue-600">{doreh.title}</span>
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/manager/dorehTahsili"
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all text-sm font-medium w-fit"
        >
          بازگشت به لیست دوره‌ها
          <ChevronLeft size={18} />
        </Link>
      </div>

      {/* کامپوننت اصلی مدیریت (Client Component) */}
      <ManageDorehPayesForm
        dorehId={dorehId}
        assignedPayes={assignedPayes}
        availablePayes={availablePayes}
      />

      {/* راهنمای کوچک برای کاربر */}
      <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-lg text-amber-800 text-sm">
        <p className="flex items-center gap-2">
          <strong>نکته:</strong>
          تغییرات در این صفحه بلافاصله اعمال می‌شوند. حذف یک پایه از این لیست،
          تنها ارتباط آن با این دوره را قطع می‌کند و خودِ پایه از سیستم حذف
          نخواهد شد.
        </p>
      </div>
    </div>
  );
}
