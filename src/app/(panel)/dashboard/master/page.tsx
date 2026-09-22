"use client";

import Link from "next/link";
import { ChevronLeft, Crown } from "lucide-react";
import { masterMenuItems } from "@/lib/hooks/menuItems";

export default function MasterDashboardPage() {
  // ⬅️ داشبورد را از لیست حذف کن
  const items = masterMenuItems.filter((item) => item.title !== "داشبورد");

  return (
    <div className="space-y-6">
      {/* هدر خوش‌آمد */}
      <div className="rounded-2xl bg-gradient-to-l from-indigo-600 to-purple-600 p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
            <Crown size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">پنل مدیریت کل</h1>
            <p className="mt-1 text-sm text-rose-100">
              به پنل مدیریت کل خوش آمدید. یکی از بخش‌های زیر را انتخاب کنید.
            </p>
          </div>
        </div>
      </div>

      {/* دکمه‌های بزرگ */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-rose-300 hover:shadow-xl"
          >
            {/* پس‌زمینه رنگی محو */}
            <div
              className={`absolute inset-0 opacity-0 transition-opacity group-hover:opacity-10 ${item.bgColor}`}
            />

            <div
              className={`relative flex h-14 w-14 items-center justify-center rounded-2xl text-3xl transition-transform group-hover:scale-110 ${item.bgColor} ${item.color}`}
            >
              {item.icon}
            </div>

            <span className="relative text-center text-sm font-medium text-zinc-700 group-hover:text-rose-600">
              {item.title}
            </span>

            {/* نشان subMenu */}
            {item.subMenu && (
              <span className="absolute right-2 top-2 rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-600">
                زیرمنو
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
