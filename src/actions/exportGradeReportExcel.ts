"use server";

import { getCurrentUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export type TeacherReportRow = {
  teacherId: string;
  teacherName: string;
  totalAssignments: number;
  submittedCount: number;
  pendingCount: number;
  totalGrades: number;
  expectedGrades: number;
  studentsMissingGrades: number;
};

export async function getGradeRegistrationReport(gradePeriodId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "MANAGER") {
    return { status: "error" as const, error: "دسترسی غیرمجاز" };
  }

  const lessons = await prisma.gradePeriodLesson.findMany({
    where: { gradePeriodId },
    select: {
      id: true,
      klassId: true,
      darsPayeReshtehId: true,
      _count: { select: { grades: true } },
      klass: {
        select: {
          id: true,
          title: true,
          classCourses: {
            select: {
              teacherId: true,
              teacher: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
          },
        },
      },
    },
  });

  const klassIds = Array.from(new Set(lessons.map((l) => l.klassId)));
  const enrollments = await prisma.studentEnrollment.groupBy({
    by: ["klassId"],
    where: { klassId: { in: klassIds } },
    _count: { _all: true },
  });
  const enrollmentMap = new Map(
    enrollments.map((e) => [e.klassId, e._count._all]),
  );

  const map = new Map<string, TeacherReportRow>();
  const NO_TEACHER_KEY = "__no_teacher__";

  for (const l of lessons) {
    const course = l.klass.classCourses.find((cc) => cc.teacherId);
    const teacherId = course?.teacherId ?? NO_TEACHER_KEY;
    const teacherName = course?.teacher
      ? `${course.teacher.firstName ?? ""} ${course.teacher.lastName ?? ""}`.trim() ||
        "نامشخص"
      : "بدون معلم";

    if (!map.has(teacherId)) {
      map.set(teacherId, {
        teacherId,
        teacherName,
        totalAssignments: 0,
        submittedCount: 0,
        pendingCount: 0,
        totalGrades: 0,
        expectedGrades: 0,
        studentsMissingGrades: 0,
      });
    }
    const row = map.get(teacherId)!;
    row.totalAssignments += 1;
    row.totalGrades += l._count.grades;
    row.expectedGrades += enrollmentMap.get(l.klassId) ?? 0;
    if (l._count.grades > 0) row.submittedCount += 1;
    else row.pendingCount += 1;
  }

  for (const row of map.values()) {
    row.studentsMissingGrades = Math.max(
      row.expectedGrades - row.totalGrades,
      0,
    );
  }

  const rows = Array.from(map.values()).sort((a, b) => {
    if (a.teacherId === NO_TEACHER_KEY) return 1;
    if (b.teacherId === NO_TEACHER_KEY) return -1;
    return b.pendingCount - a.pendingCount;
  });

  return { status: "ok" as const, data: rows };
}
