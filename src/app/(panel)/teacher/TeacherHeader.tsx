// components/layout/teacher/TeacherHeader.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // ⬅️ useRouter اضافه شد
import {
  Home,
  Menu,
  X,
  LogOut,
  User,
  ChevronLeft,
  BookOpen,
  ClipboardCheck,
  Award,
  Calendar,
  KeyRound,
} from "lucide-react";
import { authClient } from "@/lib/auth-client"; // ⬅️ authClient
import ChangePasswordModal from "@/components/widgets/ChangePasswordModal";

type Props = {
  schoolName: string;
  year: string;
  userName: string;
};

export default function TeacherHeader({ schoolName, year, userName }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false); // ⬅️ state برای خروج
  const pathname = usePathname();
  const router = useRouter(); // ⬅️ router

  // ⬅️ تابع خروج مثل NewAside
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await authClient.signOut();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("خطا در خروج از حساب:", error);
      setIsSigningOut(false);
    }
  };

  const menuItems = [
    { href: "/teacher", label: "صفحه اصلی", icon: Home },
    // { href: "/teacher/classes", label: "کلاس‌ها", icon: BookOpen },
    // { href: "/teacher/absences", label: "غیبت‌ها", icon: ClipboardCheck },
    // { href: "/teacher/grades", label: "نمرات", icon: Award },
    // { href: "/teacher/schedule", label: "برنامه هفتگی", icon: Calendar },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 md:hidden"
              aria-label="منو"
            >
              <Menu size={20} />
            </button>

            <Link href="/teacher" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Home size={18} />
              </div>
              <div className="hidden flex-col sm:flex">
                <span className="text-sm font-bold text-zinc-800">
                  پنل معلم
                </span>
                <span className="text-[10px] text-zinc-500">
                  {schoolName} - {year}
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-lg bg-zinc-100 px-3 py-1.5 sm:flex">
              <User size={16} className="text-zinc-600" />
              <span className="text-xs font-medium text-zinc-700">
                {userName}
              </span>
            </div>
            {/* ⬅️ دکمه تغییر کلمه عبور */}
            <ChangePasswordModal
              themeColor="blue"
              trigger={
                <button
                  type="button"
                  className="rounded-lg p-2 text-amber-600 hover:bg-amber-50"
                  title="تغییر کلمه عبور"
                >
                  <KeyRound size={18} />
                </button>
              }
            />
            {/* ⬅️ دکمه خروج با handleSignOut */}
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-60"
              title="خروج"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <nav className="hidden border-t border-zinc-100 bg-zinc-50/50 md:block">
          <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-2 sm:px-6 lg:px-8">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/teacher"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  <Icon size={14} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* منوی کشویی موبایل */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Home size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-zinc-800">
                    پنل معلم
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {schoolName}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="border-b border-zinc-100 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <User size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-800">
                    {userName}
                  </span>
                  <span className="text-[10px] text-zinc-500">{year}</span>
                </div>
              </div>
            </div>

            <nav className="p-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/teacher"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={16} />
                      {item.label}
                    </div>
                    <ChevronLeft size={16} className="text-zinc-400" />
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-100 p-4">
              {/* دکمه تغییر کلمه عبور */}
              <ChangePasswordModal
                themeColor="blue"
                trigger={
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-100"
                  >
                    <KeyRound size={16} />
                    تغییر کلمه عبور
                  </button>
                }
              />
              {/* ⬅️ دکمه خروج با handleSignOut */}
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <LogOut size={16} />
                {isSigningOut ? "در حال خروج..." : "خروج از حساب"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
