import Link from "next/link";
import {
  GraduationCap,
  Users,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  Shield,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
      {/* ⬅️ بک‌گراند تزئینی */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* دایره‌های تزئینی */}
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />

        {/* الگوی نقاط */}
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
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* هدر */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg">
              <GraduationCap size={22} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white sm:text-xl">
              مدیریت مدارس
            </span>
          </div>

          <Link
            href="/login"
            className="hidden rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20 sm:block"
          >
            ورود به سیستم
          </Link>
        </header>

        {/* محتوای اصلی */}
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center sm:py-16">
          {/* نشان بالای عنوان */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            سامانه جامع مدیریت آموزشی
          </div>

          {/* عنوان */}
          <h1 className="mb-6 text-3xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            مدیریت هوشمند
            <br />
            <span className="bg-gradient-to-l from-amber-300 to-amber-500 bg-clip-text text-transparent">
              مدارس و آموزش
            </span>
          </h1>

          {/* توضیحات */}
          <p className="mb-10 max-w-2xl text-sm leading-7 text-indigo-100 sm:text-base sm:leading-8">
            سامانه‌ای کامل برای مدیریت مدارس، دانش‌آموزان، معلمان، کلاس‌ها،
            نمرات، غیبت‌ها و موارد انضباطی. با پنل‌های اختصاصی برای مدیران،
            معلمان و دانش‌آموزان.
          </p>

          {/* ⬅️ دکمه ورود */}
          <div className="mb-14 flex w-full max-w-xs flex-col gap-3 sm:max-w-md sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-amber-400 to-amber-500 px-8 py-3.5 text-sm font-bold text-indigo-950 shadow-lg shadow-amber-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/40 sm:text-base"
            >
              ورود به سامانه
              <ArrowLeft
                size={18}
                className="transition-transform group-hover:-translate-x-1"
              />
            </Link>
          </div>

          {/* ویژگی‌ها */}
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Users size={24} />}
              title="مدیریت دانش‌آموزان"
              description="ثبت، ویرایش و مدیریت کامل اطلاعات دانش‌آموزان"
              color="from-blue-500/20 to-blue-600/10"
            />
            <FeatureCard
              icon={<GraduationCap size={24} />}
              title="مدیریت معلمان"
              description="تخصیص معلمان به کلاس‌ها و دروس مختلف"
              color="from-emerald-500/20 to-emerald-600/10"
            />
            <FeatureCard
              icon={<BarChart3 size={24} />}
              title="ثبت نمرات"
              description="ثبت و مدیریت نمرات به صورت توصیفی یا نمره‌ای"
              color="from-amber-500/20 to-amber-600/10"
            />
            <FeatureCard
              icon={<ClipboardCheck size={24} />}
              title="غیبت و انضباط"
              description="ثبت و پیگیری غیبت‌ها و موارد انضباطی"
              color="from-rose-500/20 to-rose-600/10"
            />
          </div>
        </div>

        {/* فوتر */}
        <footer className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-indigo-200 sm:flex-row">
          <p>© {new Date().getFullYear()} سامانه مدیریت مدارس</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Shield size={12} />
              امنیت بالا
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle size={12} />
              پشتیبانی ۲۴/۷
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}

// ⬅️ کامپوننت کارت ویژگی
function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div
      className={`group rounded-2xl border border-white/10 bg-gradient-to-br ${color} p-5 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-white/20`}
    >
      <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white transition-transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="mb-1.5 text-sm font-bold text-white sm:text-base">
        {title}
      </h3>
      <p className="text-xs leading-6 text-indigo-100">{description}</p>
    </div>
  );
}
