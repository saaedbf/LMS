"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentContext } from "@/actions/authActions";
import { PERMISSIONS } from "@/lib/permissions";

export type AttendanceLesson = {
  id: string; // ClassCourse.id
  darsTitle: string;
  units: number;
  teacherName: string | null;
  teacherId: string | null;
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
          teacherId: true,
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
      teacherId: c.teacherId,
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
        orderBy: [
          { student: { lastName: "asc" } },
          { student: { firstName: "asc" } },
        ],
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

/* ═══════════════════════════════════════════════
   معلمان برای فیلتر
   ═══════════════════════════════════════════════ */
export async function getTeachersForFilter() {
  const context = await getCurrentContext();

  if (!context?.schoolId || !context.academicYearId) {
    return { status: "error" as const, error: "کانتکست فعال یافت نشد" };
  }

  const { schoolId, academicYearId } = context;

  const assignments = await prisma.teacherAssignment.findMany({
    where: {
      schoolId,
      academicYearId,
      isActive: true,
    },
    select: {
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      teacher: { lastName: "asc" },
    },
  });

  const teacherMap = new Map<
    string,
    { id: string; firstName: string; lastName: string }
  >();
  for (const a of assignments) {
    if (a.teacher) {
      teacherMap.set(a.teacher.id, a.teacher);
    }
  }

  const teachers = Array.from(teacherMap.values()).map((t) => ({
    id: t.id,
    label: `${t.lastName} ${t.firstName}`,
  }));

  return { status: "success" as const, data: teachers };
}

/* ═══════════════════════════════════════════════
   روکش دبیر — با برنامه هفتگی
   ═══════════════════════════════════════════════ */
export type TeacherCoverSheet = {
  teacherId: string;
  teacherFirstName: string;
  teacherLastName: string;
  teacherNationalCode: string;
  teacherPersonnelCode: string | null;
  schoolTitle: string;
  schoolId: number;
  bellCount: number;
  academicYearTitle: string;
  classes: Array<{
    klassId: string;
    klassTitle: string;
    payeTitle: string;
    reshtehTitle: string;
    darsTitles: string[];
  }>;
  schedules: Array<{
    classCourseId: string;
    klassTitle: string;
    darsTitle: string;
    day: string;
    bellIndex: number;
    isHalfBell: boolean;
  }>;
};

export async function getTeacherCoverSheets() {
  const context = await getCurrentContext();

  if (!context?.schoolId || !context.academicYearId) {
    return { status: "error" as const, error: "کانتکست فعال یافت نشد" };
  }

  const { schoolId, academicYearId } = context;

  // ۱. مدرسه
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { id: true, title: true },
  });

  if (!school) {
    return { status: "error" as const, error: "مدرسه یافت نشد" };
  }

  // ۲. سال تحصیلی
  const academicYear = await prisma.academicYear.findUnique({
    where: { id: academicYearId },
    select: { title: true },
  });

  if (!academicYear) {
    return { status: "error" as const, error: "سال تحصیلی یافت نشد" };
  }

  // ۳. تعداد زنگ از تنظیمات
  const settings = await prisma.schoolSettings.findUnique({
    where: { schoolId },
    select: { dailyBellCount: true },
  });
  const bellCount = settings?.dailyBellCount ?? 3;

  // ۴. کلاس‌ها با درس‌ها، معلم‌ها و برنامه هفتگی
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
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              nationalCode: true,
              personnelCode: true,
            },
          },
          darsPayeReshteh: {
            select: {
              reshtehTadris: { select: { title: true } },
            },
          },
          schedules: {
            select: {
              day: true,
              bellIndex: true,
              isHalfBell: true,
            },
          },
        },
      },
    },
  });

  // ۵. تجمیع بر اساس دبیر
  const teacherMap = new Map<string, TeacherCoverSheet>();

  for (const klass of klasses) {
    for (const course of klass.classCourses) {
      const t = course.teacher;
      if (!t) continue;

      let sheet = teacherMap.get(t.id);

      if (!sheet) {
        sheet = {
          teacherId: t.id,
          teacherFirstName: t.firstName,
          teacherLastName: t.lastName,
          teacherNationalCode: t.nationalCode,
          teacherPersonnelCode: t.personnelCode,
          schoolTitle: school.title,
          schoolId: school.id,
          bellCount,
          academicYearTitle: academicYear.title,
          classes: [],
          schedules: [],
        };
        teacherMap.set(t.id, sheet);
      }

      const darsTitle =
        course.darsPayeReshteh?.reshtehTadris?.title ?? "نامشخص";

      // کلاس
      let classEntry = sheet.classes.find((c) => c.klassId === klass.id);
      if (!classEntry) {
        classEntry = {
          klassId: klass.id,
          klassTitle: klass.title,
          payeTitle: klass.paye?.title ?? "-",
          reshtehTitle: klass.reshtehTahsili?.title ?? "-",
          darsTitles: [],
        };
        sheet.classes.push(classEntry);
      }
      if (!classEntry.darsTitles.includes(darsTitle)) {
        classEntry.darsTitles.push(darsTitle);
      }

      // برنامه‌های هفتگی
      for (const schedule of course.schedules) {
        sheet.schedules.push({
          classCourseId: course.id,
          klassTitle: klass.title,
          darsTitle,
          day: schedule.day,
          bellIndex: schedule.bellIndex,
          isHalfBell: schedule.isHalfBell,
        });
      }
    }
  }

  // مرتب‌سازی
  const result = Array.from(teacherMap.values()).sort((a, b) =>
    a.teacherLastName.localeCompare(b.teacherLastName, "fa"),
  );

  for (const sheet of result) {
    sheet.classes.sort((a, b) =>
      a.klassTitle.localeCompare(b.klassTitle, "fa"),
    );
  }

  return { status: "success" as const, data: result };
}
