// app/(panel)/student/page.tsx
import { getCurrentContext } from "@/actions/authActions";
import { BookOpen, FileText, Calendar, Award } from "lucide-react";

export default async function StudentHomePage() {
  const { user, context } = await getCurrentContext();

  const stats = [
    {
      title: "دروس",
      value: "0",
      icon: BookOpen,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "کارنامه‌ها",
      value: "0",
      icon: FileText,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "غیبت‌ها",
      value: "0",
      icon: Calendar,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "نمرات",
      value: "-",
      icon: Award,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-l from-emerald-600 to-emerald-500 p-5 text-white shadow-lg">
        <h1 className="text-lg font-bold">
          سلام {user?.firstName || "دانش‌آموز"} عزیز 👋
        </h1>
        <p className="mt-1 text-sm text-emerald-100">
          به پنل دانش‌آموز خوش آمدید.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div
                className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}
              >
                <Icon size={18} />
              </div>
              <div className="text-lg font-bold text-zinc-800">
                {stat.value}
              </div>
              <div className="text-xs text-zinc-500">{stat.title}</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
        <p className="text-sm text-zinc-500">
          امکانات بیشتر پنل دانش‌آموز به زودی اضافه می‌شود...
        </p>
      </div>
    </div>
  );
}
