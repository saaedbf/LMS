"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BsArrowRightShort } from "react-icons/bs";
import { MdManageHistory } from "react-icons/md";
import { LogOut, KeyRound, X, Eye, EyeOff } from "lucide-react";

import NewAsideMenu from "./NewAsideMenu";
import { authClient } from "@/lib/auth-client";

type SystemRole = "MASTER" | "USER";
type SchoolRole = "MANAGER" | "DEPUTY" | "TEACHER" | "STUDENT";

interface NewAsideProps {
  user: {
    firstName: string | null;
    lastName: string | null;
    systemRole?: SystemRole | null;
  };
  role: SchoolRole | null;
}

export default function NewAside({ user, role }: NewAsideProps) {
  const [open, setOpen] = useState(true);
  const [innerWidth, setInnerWidth] = useState(0);
  const router = useRouter();

  // استیت‌های مربوط به خروج و مودال تغییر رمز عبور
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // فرم تغییر رمز عبور
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 800) {
        setOpen(false);
      }
      setInnerWidth(window.innerWidth);
    }
  }, []);

  const roleLabels: Record<string, string> = {
    MASTER: "مستر",
    MANAGER: "مدیر",
    DEPUTY: "معاون",
    TEACHER: "معلم",
    STUDENT: "دانش‌آموز",
  };

  const systemRole = user.systemRole ?? "USER";

  // اکشن خروج از حساب
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

  // اکشن تغییر کلمه عبور
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg("لطفاً تمام فیلدها را پر کنید.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("رمز عبور جدید با تکرار آن مطابقت ندارد.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("رمز عبور جدید باید حداقل ۸ کاراکتر باشد.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await authClient.changePassword({
        currentPassword: currentPassword,
        newPassword: newPassword,
        revokeOtherSessions: true, // سشن‌های دیگر کاربر را نیز منقضی می‌کند
      });

      if (error) {
        setErrorMsg(error.message || "خطایی در تغییر رمز عبور رخ داد.");
      } else {
        setSuccessMsg("رمز عبور شما با موفقیت تغییر کرد.");
        // پاکسازی فرم
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // بستن مودال پس از ۲ ثانیه به صورت خودکار
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMsg("");
        }, 2000);
      }
    } catch (err: any) {
      setErrorMsg("ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <aside
        className={`${open && innerWidth < 800 ? "flex absolute z-30" : "flex"}`}
      >
        <div
          className={`bg-DarkPurple h-screen p-5 pt-8 transition-all flex flex-col duration-300 relative ${
            open ? "w-72" : "w-20"
          }`}
        >
          <BsArrowRightShort
            onClick={() => setOpen(!open)}
            className={`bg-white text-DarkPurple text-3xl rounded-full absolute -left-4 top-9 border border-DarkPurple cursor-pointer z-10 ${
              !open && "rotate-180"
            } `}
          />

          <div className="inline-flex border-b-2 border-LightWhite pb-4">
            <MdManageHistory
              className={`bg-amber-300 text-4xl w-10 rounded cursor-pointer block ml-2 float-right duration-500 ${
                open && "rotate-[360deg]"
              }`}
            />
            <h1
              className={`text-white origin-right font-medium text-2xl ${
                !open && "hidden scale-0"
              } `}
            >
              مدیریت مدارس
            </h1>
          </div>

          <NewAsideMenu
            open={open}
            systemRole={systemRole}
            schoolRole={role ?? "STUDENT"}
          />

          {open && (
            <div className="bg-LightWhite text-gray-300 rounded-lg mt-auto flex flex-col gap-2.5 text-sm p-3">
              <div>
                <p className="font-semibold text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  نقش:{" "}
                  {systemRole === "MASTER"
                    ? roleLabels["MASTER"]
                    : role
                      ? roleLabels[role] || role
                      : "بدون نقش فعال"}
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-700">
                {/* دکمه تغییر کلمه عبور */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-md bg-slate-700 hover:bg-slate-600 px-3 py-2 text-white transition text-xs font-medium"
                >
                  <KeyRound size={15} />
                  تغییر کلمه عبور
                </button>

                {/* دکمه خروج */}
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex items-center justify-center gap-2 rounded-md bg-rose-600 hover:bg-rose-500 px-3 py-2 text-white transition disabled:cursor-not-allowed disabled:opacity-60 text-xs font-medium"
                >
                  <LogOut size={15} />
                  {isSigningOut ? "در حال خروج..." : "خروج از حساب"}
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* مودال تغییر رمز عبور */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* هدر مودال */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="text-amber-400" size={18} />
                <h3 className="font-bold text-sm">تغییر کلمه عبور</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* بدنه فرم */}
            <form
              onSubmit={handleChangePassword}
              className="p-5 flex flex-col gap-4"
            >
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-lg text-xs">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-lg text-xs">
                  {successMsg}
                </div>
              )}

              {/* کلمه عبور فعلی */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">کلمه عبور فعلی</label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-left dir-ltr outline-none transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* کلمه عبور جدید */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">کلمه عبور جدید</label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-left dir-ltr outline-none transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* تکرار کلمه عبور جدید */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">
                  تکرار کلمه عبور جدید
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-left dir-ltr outline-none transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* دکمه‌های تایید یا لغو */}
              <div className="flex justify-end gap-2.5 mt-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium transition"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-xs font-medium transition"
                >
                  {loading ? "در حال ثبت..." : "ثبت تغییرات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
