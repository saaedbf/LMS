// components/class-course/TeacherSelectModal.tsx
"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { toast } from "react-toastify";
import { Search, User, X, Check } from "lucide-react";
import {
  assignTeacherToClassCourse,
  removeTeacherFromClassCourse,
  getSchoolTeachers,
} from "@/actions/classCourseActions";
import ActionModal from "@/components/widgets/ActionModal";

type Teacher = {
  id: string;
  firstName: string;
  lastName: string;
  nationalCode: string;
};

type Props = {
  klassId: string;
  darsPayeReshtehId: string;
  currentTeacher: Teacher | null;
  onAssigned?: (teacher: Teacher | null) => void;
};

export default function TeacherSelectModal({
  klassId,
  darsPayeReshtehId,
  currentTeacher,
  onAssigned,
}: Props) {
  const [open, setOpen] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  // بارگذاری معلمان هنگام باز شدن
  useEffect(() => {
    if (open && teachers.length === 0) {
      setLoading(true);
      getSchoolTeachers()
        .then((res) => {
          if (res.status === "success") {
            setTeachers(res.data);
          } else {
            toast.error(res.error);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [open, teachers.length]);

  const filteredTeachers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter(
      (t) =>
        t.firstName.toLowerCase().includes(q) ||
        t.lastName.toLowerCase().includes(q) ||
        t.nationalCode.includes(q),
    );
  }, [teachers, search]);

  const handleSelect = (teacher: Teacher) => {
    startTransition(async () => {
      const res = await assignTeacherToClassCourse({
        klassId,
        darsPayeReshtehId,
        teacherId: teacher.id,
      });

      if (res.status === "error") {
        toast.error(res.error);
      } else {
        toast.success("معلم با موفقیت تخصیص یافت");
        onAssigned?.(teacher);
        setOpen(false);
        setSearch("");
      }
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      const res = await removeTeacherFromClassCourse(
        klassId,
        darsPayeReshtehId,
      );
      if (res.status === "error") {
        toast.error(res.error);
      } else {
        toast.success("معلم حذف شد");
        onAssigned?.(null);
        setOpen(false);
      }
    });
  };

  return (
    <ActionModal
      title="انتخاب معلم"
      desc="معلم مورد نظر را برای این درس انتخاب کنید"
      open={open}
      setOpen={setOpen}
      contentClassName="w-[95vw] max-w-md"
      trigger={
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
            currentTeacher
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300"
          }`}
        >
          <User size={14} />
          {currentTeacher
            ? `${currentTeacher.firstName} ${currentTeacher.lastName}`
            : "انتخاب معلم"}
        </button>
      }
    >
      <div className="space-y-3 p-4">
        {/* معلم فعلی */}
        {currentTeacher && (
          <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
            <div className="flex items-center gap-2">
              <User size={18} className="text-emerald-600" />
              <div>
                <div className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                  {currentTeacher.firstName} {currentTeacher.lastName}
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400">
                  {currentTeacher.nationalCode}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isPending}
              className="rounded-md p-1 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40"
              title="حذف معلم"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* جستجو */}
        <div className="relative">
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی معلم..."
            className="w-full rounded-lg border border-zinc-300 py-2 pr-9 pl-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>

        {/* لیست معلمان */}
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {loading ? (
            <div className="py-6 text-center text-sm text-zinc-400">
              در حال بارگذاری...
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="py-6 text-center text-sm text-zinc-400">
              معلمی یافت نشد
            </div>
          ) : (
            filteredTeachers.map((teacher) => {
              const isCurrent = currentTeacher?.id === teacher.id;
              return (
                <button
                  key={teacher.id}
                  type="button"
                  onClick={() => handleSelect(teacher)}
                  disabled={isPending || isCurrent}
                  className={`flex w-full items-center justify-between rounded-lg border p-2.5 text-right text-sm transition-colors ${
                    isCurrent
                      ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30"
                      : "border-zinc-200 hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-700 dark:hover:border-blue-700 dark:hover:bg-blue-950/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                      <User size={16} />
                    </div>
                    <div>
                      <div className="font-medium text-zinc-800 dark:text-zinc-200">
                        {teacher.firstName} {teacher.lastName}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {teacher.nationalCode}
                      </div>
                    </div>
                  </div>
                  {isCurrent && (
                    <Check size={16} className="text-emerald-600" />
                  )}
                </button>
              );
            })
          )}
        </div>
        <div className="flex justify-end border-t border-zinc-200 pt-3">
          <button
            className="bg-slate-300 px-3 py-1 rounded-md hover:bg-blue-300 transition"
            onClick={() => setOpen(false)}
          >
            انصراف
          </button>
        </div>
      </div>
    </ActionModal>
  );
}
