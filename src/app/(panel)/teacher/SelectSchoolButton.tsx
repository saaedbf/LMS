"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { School, GraduationCap, ChevronLeft, Loader2 } from "lucide-react";
import { setActiveContext } from "@/actions/authActions";
import { toast } from "react-toastify";

export default function SelectSchoolButton({
  assignmentId,
  schoolId,
  schoolTitle,
  schoolSubTitle,
  academicYears,
  schoolSex,
}: any) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSelect = () => {
    startTransition(async () => {
      try {
        // ⬅️ setActiveContext انتظار یک عدد (Int) را دارد
        await setActiveContext(Number(assignmentId));
        router.push(`/teacher/${schoolId}/periods`);
      } catch (error) {
        toast.error("خطا در انتخاب مدرسه");
      }
    });
  };

  return (
    <button
      onClick={handleSelect}
      disabled={isPending}
      className="group flex w-full flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md disabled:opacity-70 disabled:cursor-wait text-right"
    >
      <div className="flex w-full items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {isPending ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <School size={24} />
          )}
        </div>
        <ChevronLeft
          size={20}
          className="text-zinc-400 transition-transform group-hover:-translate-x-1"
        />
      </div>

      <h3 className="mt-3 text-base font-bold text-zinc-800">{schoolTitle}</h3>
      {schoolSubTitle && (
        <p className="mt-1 text-xs text-zinc-500">{schoolSubTitle}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {academicYears.map((year: any) => (
          <span
            key={year.id}
            className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
              year.isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-zinc-100 text-zinc-500"
            }`}
          >
            {year.title}
            {year.isActive && " (جاری)"}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-1 text-[11px] text-zinc-400">
        <GraduationCap size={12} />
        <span>
          {schoolSex === "Boy"
            ? "پسرانه"
            : schoolSex === "Girl"
              ? "دخترانه"
              : "مختلط"}
        </span>
      </div>
    </button>
  );
}
