"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import {
  GraduationCap,
  Eye,
  EyeOff,
  User,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Home,
} from "lucide-react";

const DOMAIN = "@lms.local";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const email = `${username}${DOMAIN}`;

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "کد ملی یا رمز عبور اشتباه است");
        setLoading(false);
        return;
      }

      router.push("/select-context");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("خطای غیرمنتظره در ورود. لطفاً دوباره تلاش کنید.");
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
      {/* ⬅️ بک‌گراند تزئینی */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      {/* ⬅️ محتوا */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-6 sm:px-6">
        {/* دکمه بازگشت به خانه */}
        <Link
          href="/"
          className="absolute right-4 top-4 flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-white/20 sm:text-sm"
        >
          <Home size={16} />
          صفحه اصلی
        </Link>

        <div className="w-full max-w-md">
          {/* لوگو و عنوان */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg shadow-amber-500/30">
              <GraduationCap size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              ورود به سامانه
            </h1>
            <p className="mt-2 text-sm text-indigo-200">
              برای ادامه، کد ملی و رمز عبور خود را وارد کنید
            </p>
          </div>

          {/* کارت فرم */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* کد ملی */}
              <div>
                <label className="mb-2 block text-xs font-medium text-indigo-200">
                  کد ملی / کد پرسنلی
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-300"
                  />
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 pr-10 text-sm text-white placeholder:text-indigo-300/60 outline-none transition focus:border-amber-400/60 focus:bg-white/10 focus:ring-2 focus:ring-amber-400/20"
                    dir="ltr"
                    placeholder="مثلا: master"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* رمز عبور */}
              <div>
                <label className="mb-2 block text-xs font-medium text-indigo-200">
                  رمز عبور
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-300"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 pl-12 pr-10 text-sm text-white placeholder:text-indigo-300/60 outline-none transition focus:border-amber-400/60 focus:bg-white/10 focus:ring-2 focus:ring-amber-400/20"
                    dir="ltr"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300 transition hover:text-white"
                    aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* خطا */}
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                  <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* دکمه ورود */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-amber-400 to-amber-500 px-6 py-3.5 text-sm font-bold text-indigo-950 shadow-lg shadow-amber-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:text-base"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    در حال ورود...
                  </>
                ) : (
                  <>
                    ورود به سامانه
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:-translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* لینک‌های پایین */}
            {/* <div className="mt-6 space-y-2 border-t border-white/10 pt-5 text-center">
              <Link
                href="/register"
                className="block text-xs text-indigo-200 transition hover:text-amber-300 sm:text-sm"
              >
                ساخت کاربر تستی
              </Link>
            </div> */}
          </div>

          {/* راهنما */}
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
            <p className="text-xs leading-6 text-indigo-200">
              در صورت فراموشی رمز عبور، با مدیر مدرسه تماس بگیرید.
            </p>
          </div>
        </div>

        {/* فوتر */}
        <div className="mt-8 text-center text-xs text-indigo-300">
          © {new Date().getFullYear()} سامانه مدیریت مدارس
        </div>
      </div>
    </main>
  );
}
