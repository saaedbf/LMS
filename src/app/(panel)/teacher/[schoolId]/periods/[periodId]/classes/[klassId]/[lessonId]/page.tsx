import { getClassStudentsWithGrades } from "@/actions/teacherPanelActions";
import { notFound } from "next/navigation";
import GradesForm from "./GradesForm";

type Props = {
  params: Promise<{
    schoolId: string;
    periodId: string;
    klassId: string;
    lessonId: string;
  }>;
};

export default async function GradesPage({ params }: Props) {
  const { schoolId: schoolIdStr, periodId, klassId, lessonId } = await params;

  const schoolId = Number(schoolIdStr);

  if (isNaN(schoolId)) notFound();

  const res = await getClassStudentsWithGrades(
    schoolId,
    periodId,
    klassId,
    lessonId, // ⬅️ درس انتخاب‌شده
  );

  if (res.status === "error") {
    return (
      <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">
        {res.error}
      </div>
    );
  }

  return (
    <GradesForm
      schoolId={schoolId}
      periodId={periodId}
      klassId={klassId}
      lessonId={lessonId}
      lesson={res.data.lesson}
      klass={res.data.klass}
      students={res.data.students}
      gradingType={res.data.gradingType}
    />
  );
}
