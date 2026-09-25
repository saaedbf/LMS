"use client";

import { managerMenuItems, masterMenuItems } from "@/lib//hooks/menuItems";
import { PERMISSIONS } from "@/lib/permissions";
import NewAsideLink from "./NewAsideLink";

type Props = {
  open: boolean;
  systemRole: "MASTER" | "USER";
  schoolRole: "MANAGER" | "DEPUTY" | "TEACHER" | "STUDENT";
  permissions?: string[]; // ⬅️ اضافه کنید
};

export default function NewAsideMenu({
  open,
  systemRole,
  schoolRole,
  permissions = [],
}: Props) {
  // ⬅️ نقشه دسترسی‌ها به منوها
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

  const getMenuItems = () => {
    if (systemRole === "MASTER") {
      return masterMenuItems;
    }

    if (schoolRole === "MANAGER") {
      // مدیر همه منوها را می‌بیند
      return managerMenuItems;
    }

    if (schoolRole === "DEPUTY") {
      // ⬅️ معاون فقط منوهایی که دسترسی دارد
      return managerMenuItems.filter((item) => {
        // داشبورد همیشه نمایش داده شود
        if (item.href === "/dashboard/manager") return true;

        // ⬅️ چک دسترسی
        const requiredPermission = menuPermissionMap[item.href];

        // اگر دسترسی‌ای تعریف نشده، نمایش بده
        if (!requiredPermission) return true;

        // ⬅️ اگر دسترسی دارد، نمایش بده
        return permissions.includes(requiredPermission);
      });
    }

    return [];
  };

  const items = getMenuItems();

  return (
    <nav className="mt-6 flex flex-col gap-1 overflow-y-auto">
      {items.map((item) => (
        <NewAsideLink item={item} key={item.title} open={open} />
      ))}
    </nav>
  );
}
