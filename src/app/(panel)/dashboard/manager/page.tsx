"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MdDashboard,
  MdSettings,
  MdClass,
  MdSchool,
  MdPeople,
  MdAssignment,
  MdGrade,
  MdEventBusy,
  MdGavel,
} from "react-icons/md";
import { ChevronLeft } from "lucide-react";

type MenuItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
};

const menuItems: MenuItem[] = [
  {
    title: "تنظیمات اولیه",
    href: "/dashboard/manager/settings",
    icon: <MdSettings />,
    color: "text-slate-600",
    bgColor: "bg-slate-100",
  },
  {
    title: "مدیریت کلاس",
    href: "/dashboard/manager/classes",
    icon: <MdClass />,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  {
    title: "مدیریت دانش‌آموزان",
    href: "/dashboard/manager/students",
    icon: <MdSchool />,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "مدیریت معلمان",
    href: "/dashboard/manager/teachers",
    icon: <MdPeople />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  {
    title: "تخصیص معلم به کلاس",
    href: "/dashboard/manager/class-course",
    icon: <MdAssignment />,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "تعریف دوره ثبت نمره",
    href: "/dashboard/manager/grade-periods",
    icon: <MdGrade />,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  {
    title: "مدیریت غیبت",
    href: "/dashboard/manager/absence",
    icon: <MdEventBusy />,
    color: "text-rose-600",
    bgColor: "bg-rose-100",
  },
  {
    title: "مدیریت موارد انضباطی",
    href: "/dashboard/manager/disiplinary",
    icon: <MdGavel />,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
];

export default function ManagerDashboardPage() {
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
        {menuItems.map((item) => (
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
