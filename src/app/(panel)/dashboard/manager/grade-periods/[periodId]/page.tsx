import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Users, ChevronLeft } from "lucide-react";
import BackButton from "@/components/widgets/Elements/BackButton";
import { getPayesAndLessonsForAdmin } from "@/actions/adminGradeActions";
import AdminBulkGradesByPayeModal from "./AdminBulkGradesByPayeModal";

export default async function ManagerPeriodClassesPage({
  params,
}: {
  params: Promise<{ periodId: string }>;
}) {
  const { periodId } = await params;

  // گرفتن اطلاعات دوره و کلاس‌ها + گرفتن لیست پایه‌ها و دروس
  const [period, payesRes, settings] = await Promise.all([
    prisma.gradePeriod.findUnique({
      where: { id: periodId },
      include: {
        klassPeriods: {
          include: {
            klass: {
              include: {
                paye: true,
                reshtehTahsili: true,
                _count: { select: { studentEnrollments: true } },
              },
            },
          },
        },
      },
    }),
    getPayesAndLessonsForAdmin(periodId),
    prisma.schoolSettings.findFirst({
      where: {
        school: {
          gradePeriods: {
            some: { id: periodId },
          },
        },
      },
      select: { gradingType: true },
    }),
  ]);

  if (!period) notFound();

  const payes = payesRes.status === "success" ? payesRes.data : [];
  const gradingType = settings?.gradingType || "NUMERIC";

  return (
    <div className="space-y-4 p-2">
      <BackButton
        href="/dashboard/manager/grade-periods"
        label="بازگشت به لیست دوره‌ها"
      />

      <div className="flex flex-col items-start justify-between gap-4 rounded-xl bg-gradient-to-l from-blue-600 to-blue-500 p-5 text-white shadow-lg sm:flex-row sm:items-center">
        <div>
          <h1 className="text-lg font-bold">{period.title}</h1>
          <p className="mt-1 text-sm text-blue-100">
            مدیریت نمرات کلاس‌های این دوره
          </p>
        </div>

        {/* ⬅️ دکمه ثبت گروهی برای کل پایه */}
        <AdminBulkGradesByPayeModal
          periodId={periodId}
          payes={payes}
          gradingType={gradingType}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {period.klassPeriods.map((kp) => (
          <Link
            key={kp.klass.id}
            href={`/dashboard/manager/grade-periods/${periodId}/classes/${kp.klass.id}`}
            className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users size={24} />
              </div>
              <ChevronLeft
                size={20}
                className="text-zinc-400 transition-transform group-hover:-translate-x-1"
              />
            </div>
            <h3 className="mt-3 text-base font-bold text-zinc-800">
              {kp.klass.title}
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              {kp.klass.paye.title} - {kp.klass.reshtehTahsili.title}
            </p>
            <p className="mt-2 text-xs font-medium text-blue-600">
              {kp.klass._count.studentEnrollments} دانش‌آموز
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
