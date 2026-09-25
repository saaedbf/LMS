import Link from "next/link";

import { managerMenuItems } from "@/lib/hooks/menuItems";
import { PERMISSIONS } from "@/lib/permissions";
import { getCurrentContext } from "@/actions/authActions";
type MenuItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
};

export default async function ManagerDashboardPage() {
  const { context, permissions } = await getCurrentContext();

  const isManager = context?.role === "MANAGER";

  // ⬅️ نقشه دسترسی‌ها
  const menuPermissionMap: Record<string, string> = {
    "/dashboard/manager/students": PERMISSIONS.MANAGE_STUDENTS,
    "/dashboard/manager/teachers": PERMISSIONS.MANAGE_TEACHERS,
    "/dashboard/manager/classes": PERMISSIONS.MANAGE_CLASSES,
    "/dashboard/manager/class-course": PERMISSIONS.MANAGE_CLASS_COURSES,
    "/dashboard/manager/grade-periods": PERMISSIONS.MANAGE_GRADE_PERIODS,
    "/dashboard/manager/absence": PERMISSIONS.MANAGE_ABSENCES,
    "/dashboard/manager/disiplinary": PERMISSIONS.MANAGE_DISCIPLINARY,
    "/dashboard/manager/settings": PERMISSIONS.MANAGE_SETTINGS,
  };

  // ⬅️ فیلتر منوها
  const visibleItems = managerMenuItems.filter((item) => {
    if (isManager) return true; // مدیر همه را می‌بیند

    if (item.href === "/dashboard/manager") return true;
    if (item.href === "/dashboard/manager/deputies") return true; // معاون نمی‌تواند معاون تعریف کند

    const requiredPermission = menuPermissionMap[item.href];
    if (!requiredPermission) return true;

    return permissions.includes(requiredPermission);
  });

  return (
    <div className="space-y-6">
      {/* هدر خوش‌آمد */}
      <div className="rounded-2xl bg-gradient-to-l from-indigo-600 to-purple-600 p-6 text-white shadow-lg">
        <h1 className="text-xl font-bold sm:text-2xl">پنل مدیریت مدرسه</h1>
        <p className="mt-1 text-sm text-indigo-100">
          به پنل مدیریت خوش آمدید. یکی از بخش‌های زیر را انتخاب کنید.
        </p>
      </div>

      {/* دکمه‌های بزرگ */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl sm:p-5"
          >
            {/* پس‌زمینه رنگی محو */}
            <div
              className={`absolute inset-0 opacity-0 transition-opacity group-hover:opacity-10 ${item.bgColor}`}
            />

            <div
              className={`relative flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-transform group-hover:scale-110 sm:h-14 sm:w-14 sm:text-3xl ${item.bgColor} ${item.color}`}
            >
              {item.icon}
            </div>

            <span className="relative text-center text-xs font-medium text-zinc-700 group-hover:text-indigo-600 sm:text-sm">
              {item.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
