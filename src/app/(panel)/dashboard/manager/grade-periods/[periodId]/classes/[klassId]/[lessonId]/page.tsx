import { notFound } from "next/navigation";
import { getStudentsForAdminGrading } from "@/actions/adminGradeActions"; // ⬅️ اکشن جدید
import AdminGradesForm from "./AdminGradesForm";

type Props = {
  params: Promise<{
    periodId: string;
    klassId: string;
    lessonId: string;
    lesson: {
      id: string;
      title: string;
      units: number;
      questionCount?: number | null; // ⬅️ این خط را تغییر دهید (اضافه شدن | null)
    };
  }>;
};

export default async function AdminGradesPage({ params }: Props) {
  const { periodId, klassId, lessonId } = await params;

  const res = await getStudentsForAdminGrading(periodId, klassId, lessonId);

  if (res.status === "error") {
    return (
      <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">
        {res.error}
      </div>
    );
  }

  return (
    <AdminGradesForm
      periodId={periodId}
      klassId={klassId}
      lessonId={lessonId}
      lesson={res.data.lesson}
      klass={res.data.klass}
      students={res.data.students}
      gradingType={res.data.gradingType}
      // ⬅️ این دو پراپ باید پاس داده شوند
      isTest={res.data.isTest}
      hasNegativeScore={res.data.hasNegativeScore}
    />
  );
}
