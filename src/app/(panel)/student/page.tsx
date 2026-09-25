import { getCurrentContext } from "@/actions/authActions";
import { getStudentPanelData } from "@/actions/studentPanelActions";
import {
  BookOpen,
  FileText,
  Calendar,
  Award,
  Wallet,
  AlertTriangle,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";

export default async function StudentHomePage() {
  const { user } = await getCurrentContext();
  const res = await getStudentPanelData();

  if (res.status === "error") {
    return (
      <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">
        {res.error}
      </div>
    );
  }

  const { student, enrollment, settings, counts } = res.data;

  // ⬅️ ساخت کارت‌ها به صورت پویا بر اساس تنظیمات
  const stats: Array<{
    title: string;
    value: string;
    icon: any;
    color: string;
    href?: string;
    show: boolean;
  }> = [
    {
      title: "کارنامه‌ها",
      value: "-",
      icon: FileText,
      color: "bg-emerald-50 text-emerald-600",
      href: "/student/grades",
      show: settings.showReportCardsInStudentPanel,
    },
    {
      title: "غیبت‌ها",
      value: String(counts.absences),
      icon: Calendar,
      color: "bg-amber-50 text-amber-600",
      href: "/student/absences",
      show: settings.showAbsencesInStudentPanel,
    },
    {
      title: "موارد انضباطی",
      value: String(counts.disciplinaries),
      icon: AlertTriangle,
      color: "bg-rose-50 text-rose-600",
      href: "/student/disciplinary",
      show: settings.showDisciplinaryInStudentPanel,
    },
    {
      title: "شهریه",
      value: "-",
      icon: Wallet,
      color: "bg-blue-50 text-blue-600",
      href: "/student/tuition",
      show: settings.showTuitionInStudentPanel,
    },
  ];

  const visibleStats = stats.filter((s) => s.show);

  return (
    <div className="space-y-4">
      {/* خوش‌آمد */}
      <div className="rounded-xl bg-gradient-to-l from-emerald-600 to-emerald-500 p-5 text-white shadow-lg">
        <h1 className="text-lg font-bold">سلام {student.firstName} عزیز 👋</h1>
        <p className="mt-1 text-sm text-emerald-100">
          به پنل دانش‌آموز خوش آمدید.
        </p>
      </div>

      {/* اطلاعات تحصیلی */}
      {enrollment && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 border-b border-zinc-100 pb-3">
            <GraduationCap size={20} className="text-emerald-600" />
            <h2 className="text-sm font-bold text-zinc-800">اطلاعات تحصیلی</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <div className="text-xs text-zinc-500">پایه</div>
              <div className="mt-1 text-sm font-medium text-zinc-800">
                {enrollment.payeTitle}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">رشته</div>
              <div className="mt-1 text-sm font-medium text-zinc-800">
                {enrollment.reshtehTahsiliTitle}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">کلاس</div>
              <div className="mt-1 text-sm font-medium text-zinc-800">
                {enrollment.klassTitle}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">کد ملی</div>
              <div className="mt-1 text-sm font-medium text-zinc-800" dir="ltr">
                {student.nationalCode}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* آمار (پویا) */}
      {visibleStats.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {visibleStats.map((stat) => {
            const Icon = stat.icon;
            const content = (
              <div
                key={stat.title}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
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

            return stat.href ? (
              <Link key={stat.title} href={stat.href}>
                {content}
              </Link>
            ) : (
              content
            );
          })}
        </div>
      )}

      {/* اگر همه تنظیمات غیرفعال باشند */}
      {visibleStats.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">
            امکانات پنل دانش‌آموز توسط مدیر مدرسه غیرفعال شده است.
          </p>
        </div>
      )}

      {/* اگر تنظیمات همه فعال باشند ولی در حال توسعه */}
      {visibleStats.length > 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">
            امکانات بیشتر پنل دانش‌آموز به زودی اضافه می‌شود...
          </p>
        </div>
      )}
    </div>
  );
}
