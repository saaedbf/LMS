"use server";

import { prisma } from "@/lib/prisma";
import { getScope } from "@/lib/auth-helpers";
import { isScopeError } from "@/lib/auth-helpers-utils";
import { PERMISSIONS } from "@/lib/permissions";

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
  try {
    const scope = await getScope(PERMISSIONS.MANAGE_GRADE_PERIODS);
    if (isScopeError(scope)) {
      return { status: "error" as const, error: scope.error };
    }

    const { schoolId, academicYearId } = scope;

    const period = await prisma.gradePeriod.findFirst({
      where: { id: gradePeriodId, schoolId, academicYearId },
      select: {
        id: true,
        title: true,
        school: { select: { title: true } },
        academicYear: { select: { title: true } },
      },
    });

    if (!period) {
      return { status: "error" as const, error: "دوره یافت نشد" };
    }

    // ⬇️ همه‌ی GradePeriodLesson این دوره
    //    برای هر کدوم، ClassCourse متناظر رو با (klassId + darsPayeReshtehId) پیدا کن
    const lessons = await prisma.gradePeriodLesson.findMany({
      where: { gradePeriodId },
      select: {
        id: true,
        klassId: true,
        darsPayeReshtehId: true,
        _count: { select: { grades: true } },
      },
    });

    // ⬇️ یک‌جا همه‌ی ClassCourseهای مربوطه رو بگیر (بهینه‌تر از N+1)
    const pairs = lessons.map((l) => ({
      klassId: l.klassId,
      darsPayeReshtehId: l.darsPayeReshtehId,
    }));

    const classCourses = await prisma.classCourse.findMany({
      where: {
        OR: pairs.map((p) => ({
          klassId: p.klassId,
          darsPayeReshtehId: p.darsPayeReshtehId,
        })),
      },
      select: {
        klassId: true,
        darsPayeReshtehId: true,
        teacherId: true,
        teacher: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // ⬇️ map با کلید ترکیبی (klassId + darsPayeReshtehId)
    const courseKey = (klassId: string, darsId: string) =>
      `${klassId}::${darsId}`;

    const courseMap = new Map<
      string,
      {
        teacherId: string | null;
        teacher: {
          id: string;
          firstName: string | null;
          lastName: string | null;
        } | null;
      }
    >();

    for (const cc of classCourses) {
      courseMap.set(courseKey(cc.klassId, cc.darsPayeReshtehId), {
        teacherId: cc.teacherId,
        teacher: cc.teacher,
      });
    }

    // ⬇️ تعداد دانش‌آموزان هر کلاس
    const klassIds = Array.from(new Set(lessons.map((l) => l.klassId)));
    const enrollments = await prisma.studentEnrollment.groupBy({
      by: ["klassId"],
      where: { klassId: { in: klassIds } },
      _count: { _all: true },
    });
    const enrollmentMap = new Map(
      enrollments.map((e) => [e.klassId, e._count._all]),
    );

    // ⬇️ گروه‌بندی بر اساس معلم
    const map = new Map<string, TeacherReportRow>();
    const NO_TEACHER_KEY = "__no_teacher__";

    for (const l of lessons) {
      const course = courseMap.get(courseKey(l.klassId, l.darsPayeReshtehId));
      const teacherId = course?.teacherId ?? NO_TEACHER_KEY;
      const teacherName = course?.teacher
        ? `${course.teacher.firstName ?? ""} ${course.teacher.lastName ?? ""}`.trim() ||
          "نامشخص"
        : "بدون معلم (بدون تخصیص)";

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

    // ⬇️ مرتب‌سازی بر اساس درصد پیشرفت نزولی
    const rows = Array.from(map.values()).sort((a, b) => {
      if (a.teacherId === NO_TEACHER_KEY) return 1;
      if (b.teacherId === NO_TEACHER_KEY) return -1;

      const pctA =
        a.totalAssignments > 0 ? a.submittedCount / a.totalAssignments : 0;
      const pctB =
        b.totalAssignments > 0 ? b.submittedCount / b.totalAssignments : 0;

      if (pctB !== pctA) return pctB - pctA;
      if (b.totalAssignments !== a.totalAssignments)
        return b.totalAssignments - a.totalAssignments;
      return a.teacherName.localeCompare(b.teacherName, "fa");
    });

    return {
      status: "ok" as const,
      data: rows,
      meta: {
        periodTitle: period.title,
        schoolTitle: period.school.title,
        academicYearTitle: period.academicYear.title,
      },
    };
  } catch (error) {
    console.error("[getGradeRegistrationReport]", error);
    return { status: "error" as const, error: "خطا در دریافت گزارش" };
  }
}
