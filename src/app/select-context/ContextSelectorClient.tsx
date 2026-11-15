"use client";

import { setActiveContext } from "@/actions/authActions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { GraduationCap, Users, Shield, BookOpen, Loader2 } from "lucide-react";

type Assignment = {
  id: number;
  role: string;
  schoolId: number;
  academicYearId: number;
  schoolTitle: string;
  academicYearTitle: string;
  isActive: boolean;
  permissions?: string[];
};

const ROLE_FA: Record<string, string> = {
  MANAGER: "مدیر",
  DEPUTY: "کادر اجرایی",
  TEACHER: "معلم",
  STUDENT: "دانش‌آموز",
};

const ROLE_ICON: Record<string, React.ComponentType<{ size?: number }>> = {
  MANAGER: Shield,
  DEPUTY: Users,
  TEACHER: BookOpen,
  STUDENT: GraduationCap,
};

const ROLE_COLOR: Record<string, string> = {
  MANAGER: "bg-indigo-100 text-indigo-700 border-indigo-300",
  DEPUTY: "bg-violet-100 text-violet-700 border-violet-300",
  TEACHER: "bg-emerald-100 text-emerald-700 border-emerald-300",
  STUDENT: "bg-blue-100 text-blue-700 border-blue-300",
};

function getRedirectPath(role: string): string {
  switch (role) {
    case "MANAGER":
    case "DEPUTY":
      return "/dashboard";
    case "TEACHER":
      return "/teacher";
    case "STUDENT":
      return "/student";
    default:
      return "/dashboard";
  }
}

export default function ContextSelectorClient({
  initialAssignments,
  title,
}: {
  initialAssignments: Assignment[];
  title: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSelect = (id: number, role: string) => {
    startTransition(async () => {
      try {
        await setActiveContext(id);
        router.push(getRedirectPath(role));
        router.refresh();
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <div className="w-full max-w-2xl rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
      <h1 className="mb-2 text-center text-xl font-bold text-gray-800">
        {title}
      </h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        یکی از نقش‌ها و مدارس زیر را انتخاب کنید
      </p>

      <div className="space-y-3">
        {initialAssignments.map((item) => {
          const Icon = ROLE_ICON[item.role] || Shield;
          const roleColor =
            ROLE_COLOR[item.role] ||
            "bg-gray-100 text-gray-700 border-gray-300";
          const roleFa = ROLE_FA[item.role] || item.role;

          return (
            <button
              key={item.id}
              type="button"
              disabled={isPending}
              onClick={() => handleSelect(item.id, item.role)}
              className="group flex w-full items-center gap-4 rounded-xl border-2 border-gray-100 p-4 text-right transition-all hover:border-indigo-400 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border-2 ${roleColor}`}
              >
                <Icon size={22} />
              </div>

              <div className="flex-1">
                <p className="font-bold text-gray-800 group-hover:text-indigo-700">
                  {item.schoolTitle}
                </p>
                <p className="mt-0.5 text-sm text-gray-500">
                  سال تحصیلی: {item.academicYearTitle}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span
                  className={`rounded-md border px-2 py-1 text-xs font-medium ${roleColor}`}
                >
                  {roleFa}
                </span>
                {item.permissions && item.permissions.length > 0 && (
                  <span className="text-[10px] text-gray-400">
                    {item.permissions.length} دسترسی
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {isPending && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-indigo-600">
          <Loader2 size={16} className="animate-spin" />
          در حال ورود...
        </div>
      )}
    </div>
  );
}
