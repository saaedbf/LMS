// app/dashboard/manager/fix-access/page.tsx
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function FixAccessPage() {
  // پیدا کردن معلم‌های بدون UserAssignment
  const teachersWithoutAccess = await prisma.teacher.findMany({
    where: {
      userId: { not: null },
      user: {
        assignments: {
          none: { role: "TEACHER" },
        },
      },
    },
    include: {
      user: true,
      assignments: { where: { isActive: true } },
    },
  });

  // پیدا کردن دانش‌آموزهای بدون UserAssignment
  const studentsWithoutAccess = await prisma.student.findMany({
    where: {
      enrollments: { some: {} }, // حداقل یک ثبت‌نام دارد
    },
    include: {
      enrollments: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  async function fixAll() {
    "use server";

    // Fix teachers
    for (const teacher of teachersWithoutAccess) {
      if (!teacher.userId) continue;

      for (const assignment of teacher.assignments) {
        const existing = await prisma.userAssignment.findFirst({
          where: {
            userId: teacher.userId,
            schoolId: assignment.schoolId,
            academicYearId: assignment.academicYearId,
            role: "TEACHER",
          },
        });

        if (!existing) {
          await prisma.userAssignment.create({
            data: {
              userId: teacher.userId,
              schoolId: assignment.schoolId,
              academicYearId: assignment.academicYearId,
              role: "TEACHER",
              isActive: true,
            },
          });
        }
      }
    }

    // Fix students
    for (const student of studentsWithoutAccess) {
      const studentEmail = `${student.nationalCode}@lms.local`.toLowerCase();

      const authUser = await prisma.user.findUnique({
        where: { email: studentEmail },
        select: { id: true },
      });

      if (!authUser) continue;

      for (const enrollment of student.enrollments) {
        const existing = await prisma.userAssignment.findFirst({
          where: {
            userId: authUser.id,
            schoolId: enrollment.schoolId,
            academicYearId: enrollment.academicYearId,
            role: "STUDENT",
          },
        });

        if (!existing) {
          await prisma.userAssignment.create({
            data: {
              userId: authUser.id,
              schoolId: enrollment.schoolId,
              academicYearId: enrollment.academicYearId,
              role: "STUDENT",
              isActive: true,
            },
          });
        }
      }
    }

    revalidatePath("/dashboard/manager/fix-access");
  }

  return (
    <div className="p-8">
      <h1 className="mb-4 text-xl font-bold">Fix UserAssignments</h1>

      <div className="mb-4 space-y-2">
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-sm">
            معلمان بدون دسترسی: <strong>{teachersWithoutAccess.length}</strong>
          </p>
        </div>

        <div className="rounded-lg bg-emerald-50 p-4">
          <p className="text-sm">
            دانش‌آموزان نیازمند بررسی:{" "}
            <strong>{studentsWithoutAccess.length}</strong>
          </p>
        </div>
      </div>

      <form action={fixAll}>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          اجرای Fix برای همه
        </button>
      </form>
    </div>
  );
}
