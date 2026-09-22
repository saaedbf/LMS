"use client";

import { useState, ReactNode } from "react";
import { toast } from "react-toastify";
import { KeyRound, X, Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type Props = {
  trigger: ReactNode;
  contentClassName?: string;
  themeColor?: "blue" | "emerald" | "purple";
};

export default function ChangePasswordModal({
  trigger,
  contentClassName = "",
  themeColor = "blue",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // رنگ دکمه بر اساس theme
  const themeClasses = {
    blue: "bg-blue-600 hover:bg-blue-500 focus:ring-blue-500",
    emerald: "bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-500",
    purple: "bg-purple-600 hover:bg-purple-500 focus:ring-purple-500",
  };

  const handleClose = () => {
    setIsOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        setErrorMsg(error.message || "خطایی در تغییر رمز عبور رخ داد.");
      } else {
        setSuccessMsg("رمز عبور شما با موفقیت تغییر کرد.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (err) {
      setErrorMsg("ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* تریگر */}
      <div onClick={() => setIsOpen(true)}>{trigger}</div>

      {/* مودال */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div
            className={`w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-zinc-900 ${contentClassName}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* هدر */}
            <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <KeyRound size={18} className="text-amber-500" />
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                  تغییر کلمه عبور
                </h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* فرم */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
              {errorMsg && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {successMsg}
                </div>
              )}

              {/* رمز فعلی */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">
                  کلمه عبور فعلی
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-left outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* رمز جدید */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">
                  کلمه عبور جدید
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-left outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* تکرار رمز جدید */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">
                  تکرار کلمه عبور جدید
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-left outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* دکمه‌ها */}
              <div className="mt-2 flex justify-end gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg bg-zinc-100 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`rounded-lg px-4 py-2 text-xs font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${themeClasses[themeColor]}`}
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
