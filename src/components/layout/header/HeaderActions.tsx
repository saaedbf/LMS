"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, KeyRound, X, Eye, EyeOff, ArrowLeftRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getUserAssignments } from "@/actions/authActions";

export default function HeaderActions() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignmentCount, setAssignmentCount] = useState<number | null>(null);

  // فرم تغییر رمز
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // گرفتن تعداد نقش‌ها
  useEffect(() => {
    getUserAssignments(false)
      .then((a) => setAssignmentCount(a.length))
      .catch(() => setAssignmentCount(0));
  }, []);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await authClient.signOut();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("خطا در خروج:", error);
      setIsSigningOut(false);
    }
  };

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
          setIsModalOpen(false);
          setSuccessMsg("");
        }, 2000);
      }
    } catch {
      setErrorMsg("ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  };

  // فقط اگر بیش از یک نقش دارد، دکمه تعویض نقش را نشان بده
  const showSwitchContext = assignmentCount !== null && assignmentCount > 1;

  return (
    <>
      <div className="flex items-center gap-2">
        {/* دکمه تعویض نقش — فقط برای چندنقشه */}
        {showSwitchContext && (
          <button
            type="button"
            onClick={() => router.push("/select-context")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs text-white transition"
          >
            <ArrowLeftRight size={14} />
            تعویض نقش
          </button>
        )}

        {/* تغییر رمز */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs text-white transition"
        >
          <KeyRound size={14} />
          تغییر رمز
        </button>

        {/* خروج */}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 px-3 py-1.5 text-xs text-white transition disabled:opacity-50"
        >
          <LogOut size={14} />
          {isSigningOut ? "..." : "خروج"}
        </button>
      </div>

      {/* مودال تغییر رمز */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
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

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">کلمه عبور فعلی</label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-left dir-ltr outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">کلمه عبور جدید</label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-left dir-ltr outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">
                  تکرار کلمه عبور جدید
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-left dir-ltr outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 mt-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-xs"
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
