"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

const DOMAIN = "@lms.local";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const email = `${username}${DOMAIN}`;

    // ۱. انجام عملیات احراز هویت
    const result = await authClient.signIn.email({
      email,
      password,
      // اگر از قابلیت rememberMe استفاده می‌کنی می‌توانی اینجا اضافه کنی
      // rememberMe: true,
    });

    if (result.error) {
      setError(result.error.message || "خطایی در ورود رخ داد");
      setLoading(false);
      return;
    }

    // ۲. تغییر مسیر به صفحه انتخاب کانتکست (ایستگاه بازرسی)
    // اینجا به جای dashboard، به صفحه انتخاب محیط کاری می‌رویم
    router.push("/select-context");

    // ۳. رفرش کردن استیت سرور برای اینکه سشن جدید شناسایی شود
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">ورود به سامانه</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              کد ملی / کد پرسنلی
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              dir="ltr"
              placeholder="مثلا: master"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              رمز عبور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              dir="ltr"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white py-2 rounded font-semibold disabled:bg-blue-300"
          >
            {loading ? "در حال ورود..." : "ورود"}
          </button>
          <Link
            href="/register"
            className="text-sm text-primary hover:underline"
          >
            ساخت کاربر تستی
          </Link>
        </form>
      </div>
    </div>
  );
}
