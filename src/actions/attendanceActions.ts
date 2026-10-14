"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentContext } from "@/actions/authActions";
import { PERMISSIONS } from "@/lib/permissions";

export type AttendanceLesson = {
  id: string; // ClassCourse.id
  darsTitle: string;
  units: number;
  teacherName: string | null;
};

export type AttendanceClassNode = {
  id: string; // Klass.id
  title: string;
  payeTitle: string;
  reshtehTitle: string;
  lessons: AttendanceLesson[];
};

export type AttendanceStudent = {
  id: string;
  nationalCode: string;
  firstName: string;
  lastName: string;
  fatherName: string | null;
};

export type AttendanceSheet = {
  klassId: string;
  klassTitle: string;
  schoolTitle: string;
  schoolId: number;
  doreTitle: string;
  payeTitle: string;
  reshtehTitle: string;
  academicYearTitle: string;
  darsTitle: string;
  teacherName: string | null;
  students: AttendanceStudent[];
};

/* ═══════════════════════════════════════════════
   لیست درختی: کلاس‌ها با درس‌هایشان
   ═══════════════════════════════════════════════ */
export async function getAttendanceTree() {
  const context = await getCurrentContext();

  if (!context?.schoolId || !context.academicYearId) {
    return { status: "error" as const, error: "کانتکست فعال یافت نشد" };
  }

  const isManager = context.role === "MANAGER";
  const isDeputyWithAccess =
    context.role === "DEPUTY" &&
    context.permissions.includes(PERMISSIONS.MANAGE_CLASSES);

  if (!isManager && !isDeputyWithAccess) {
    return { status: "error" as const, error: "دسترسی ندارید" };
  }

  const { schoolId, academicYearId } = context;

  const klasses = await prisma.klass.findMany({
    where: { schoolId, academicYearId },
    select: {
      id: true,
      title: true,
      paye: { select: { title: true } },
      reshtehTahsili: { select: { title: true } },
      classCourses: {
        select: {
          id: true,
          darsPayeReshteh: {
            select: {
              units: true,
              reshtehTadris: { select: { title: true } },
            },
          },
          teacher: { select: { firstName: true, lastName: true } },
        },
        orderBy: {
          darsPayeReshteh: { reshtehTadris: { title: "asc" } },
        },
      },
    },
    orderBy: [{ payeId: "asc" }, { title: "asc" }],
  });

  const tree: AttendanceClassNode[] = klasses.map((k) => ({
    id: k.id,
    title: k.title,
    payeTitle: k.paye.title,
    reshtehTitle: k.reshtehTahsili.title,
    lessons: k.classCourses.map((c) => ({
      id: c.id,
      darsTitle: c.darsPayeReshteh.reshtehTadris.title,
      units: c.darsPayeReshteh.units,
      teacherName: c.teacher
        ? `${c.teacher.firstName} ${c.teacher.lastName}`
        : null,
    })),
  }));

  return { status: "success" as const, data: tree };
}

/* ═══════════════════════════════════════════════
   برگه‌های چاپ: برای هر (کلاس، درس) یک برگه
   ═══════════════════════════════════════════════ */
export async function getAttendanceSheets(
  selections: Array<{ klassId: string; classCourseIds: string[] }>,
) {
  const context = await getCurrentContext();

  if (!context?.schoolId || !context.academicYearId) {
    return { status: "error" as const, error: "کانتکست فعال یافت نشد" };
  }

  const { schoolId, academicYearId } = context;

  if (selections.length === 0) {
    return { status: "success" as const, data: [] as AttendanceSheet[] };
  }

  const klassIds = selections.map((s) => s.klassId);

  const klasses = await prisma.klass.findMany({
    where: {
      id: { in: klassIds },
      schoolId,
      academicYearId,
    },
    select: {
      id: true,
      title: true,
      school: {
        select: {
          id: true,
          title: true,
          doreTahsili: { select: { title: true } },
        },
      },
      academicYear: { select: { title: true } },
      paye: { select: { title: true } },
      reshtehTahsili: { select: { title: true } },
      studentEnrollments: {
        select: {
          student: {
            select: {
              id: true,
              nationalCode: true,
              firstName: true,
              lastName: true,
              fatherName: true,
            },
          },
        },
        orderBy: { student: { lastName: "asc" } },
      },
      classCourses: {
        select: {
          id: true,
          darsPayeReshteh: {
            select: {
              units: true,
              reshtehTadris: { select: { title: true } },
            },
          },
          teacher: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  const sheets: AttendanceSheet[] = [];

  for (const klass of klasses) {
    const selection = selections.find((s) => s.klassId === klass.id);
    if (!selection) continue;

    const students = klass.studentEnrollments.map((e) => ({
      id: e.student.id,
      nationalCode: e.student.nationalCode,
      firstName: e.student.firstName,
      lastName: e.student.lastName,
      fatherName: e.student.fatherName,
    }));

    // برای هر ClassCourse انتخاب‌شده، یک برگه بساز
    for (const courseId of selection.classCourseIds) {
      const course = klass.classCourses.find((c) => c.id === courseId);
      if (!course) continue;

      sheets.push({
        klassId: klass.id,
        klassTitle: klass.title,
        schoolTitle: klass.school.title,
        schoolId: klass.school.id,
        doreTitle: klass.school.doreTahsili?.title ?? "",
        payeTitle: klass.paye.title,
        reshtehTitle: klass.reshtehTahsili.title,
        academicYearTitle: klass.academicYear.title,
        darsTitle: course.darsPayeReshteh.reshtehTadris.title,
        teacherName: course.teacher
          ? `${course.teacher.firstName} ${course.teacher.lastName}`
          : null,
        students,
      });
    }
  }

  return { status: "success" as const, data: sheets };
}
