"use client";

import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { createTeacherUserAssignment } from "@/actions/teacherActions";
import { useRouter } from "next/navigation";

// یک کامپوننت کوچک برای دکمه
export function FixTeacherAssignmentBtn({
  teacherId,
  schoolId,
  academicYearId,
}: {
  teacherId: string;
  schoolId: number;
  academicYearId: number;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFix = async () => {
    setLoading(true);
    const res = await createTeacherUserAssignment(
      teacherId,
      schoolId,
      academicYearId,
    );
    setLoading(false);

    if (res.status === "error") {
      toast.error(res.error);
    } else {
      toast.success("دسترسی معلم برای این مدرسه با موفقیت ایجاد شد");
      router.refresh(); // رفرش صفحه
    }
  };

  return (
    <button
      type="button"
      onClick={handleFix}
      disabled={loading}
      title="ایجاد دسترسی در این مدرسه و سال"
      className="inline-flex h-9 items-center justify-center rounded-md border border-amber-300 px-2 text-xs text-amber-700 transition hover:bg-amber-50 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <KeyRound size={14} />
      )}
      دسترسی
    </button>
  );
}
