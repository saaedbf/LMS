"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentContext } from "@/actions/authActions";
import {
  WEEK_DAYS,
  type WeekDay,
  type WeeklyAttendanceData,
  type WeeklyTeacherRow,
  type WeeklyTeacherDayInfo,
} from "@/types/weeklyTeacherAttendanceTypes";

export async function getWeeklyTeacherAttendance(params?: {
  weekStart?: string;
}): Promise<
  | { status: "success"; data: WeeklyAttendanceData }
  | { status: "error"; error: string }
> {
  const context = await getCurrentContext();
  if (!context?.schoolId || !context.academicYearId) {
    return { status: "error", error: "کانتکست فعال یافت نشد" };
  }

  const { schoolId, academicYearId } = context;

  const [school, academicYear] = await Promise.all([
    prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true, title: true, modirName: true },
    }),
    prisma.academicYear.findUnique({
      where: { id: academicYearId },
      select: { title: true },
    }),
  ]);

  if (!school || !academicYear) {
    return { status: "error", error: "مدرسه یا سال تحصیلی یافت نشد" };
  }

  // ⬇⬇ کادر اجرایی — با nationalCode
  const deputyAssignments = await prisma.deputyAssignment.findMany({
    where: { schoolId, academicYearId, isActive: true },
    include: {
      deputy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          nationalCode: true, // ⬅️
          position: true,
          attendanceOrder: true,
          attendanceDays: true,
        },
      },
    },
  });

  const deputies = deputyAssignments
    .map((a) => a.deputy)
    .sort((a, b) => {
      const orderDiff = a.attendanceOrder - b.attendanceOrder;
      if (orderDiff !== 0) return orderDiff;
      const ln = a.lastName.localeCompare(b.lastName, "fa");
      if (ln !== 0) return ln;
      return a.firstName.localeCompare(b.firstName, "fa");
    });

  // ⬇⬇ مجموعه کد ملی کادر اجرایی
  const deputyNationalCodes = new Set(
    deputies.map((d) => d.nationalCode).filter(Boolean),
  );

  // ⬇⬇ معلمان — با nationalCode
  const klasses = await prisma.klass.findMany({
    where: { schoolId, academicYearId },
    select: {
      id: true,
      title: true,
      classCourses: {
        select: {
          id: true,
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              nationalCode: true, // ⬅️
            },
          },
          darsPayeReshteh: {
            select: { reshtehTadris: { select: { title: true } } },
          },
          schedules: { select: { day: true, bellIndex: true } },
        },
      },
    },
  });

  type TeacherAgg = {
    teacherId: string;
    firstName: string;
    lastName: string;
    dayMap: Map<
      WeekDay,
      Array<{ klassTitle: string; darsTitle: string; bellIndex: number }>
    >;
  };

  const teacherMap = new Map<string, TeacherAgg>();

  for (const klass of klasses) {
    for (const course of klass.classCourses) {
      const t = course.teacher;
      if (!t) continue;

      // ⬇⬇ فیلتر با کد ملی (نه id)
      if (deputyNationalCodes.has(t.nationalCode)) continue;

      let agg = teacherMap.get(t.id);
      if (!agg) {
        agg = {
          teacherId: t.id,
          firstName: t.firstName,
          lastName: t.lastName,
          dayMap: new Map(),
        };
        teacherMap.set(t.id, agg);
      }

      const darsTitle =
        course.darsPayeReshteh?.reshtehTadris?.title ?? "نامشخص";

      for (const sch of course.schedules) {
        const day = sch.day as WeekDay;
        if (!WEEK_DAYS.includes(day)) continue;
        const arr = agg.dayMap.get(day) ?? [];
        arr.push({
          klassTitle: klass.title,
          darsTitle,
          bellIndex: sch.bellIndex,
        });
        agg.dayMap.set(day, arr);
      }
    }
  }

  // ⬇⬇ ساخت ردیف‌ها (بدون تغییر)
  const rows: WeeklyTeacherRow[] = [];

  if (school.modirName) {
    const managerDays = WEEK_DAYS.map(() => ({
      hasClass: true,
      lessonsCount: 0,
      details: [],
    })) as WeeklyTeacherDayInfo[];
    rows.push({
      teacherId: "manager",
      firstName: school.modirName,
      lastName: "",
      position: "مدیر",
      days: managerDays,
    });
  }

  for (const d of deputies) {
    const days = WEEK_DAYS.map((day) => {
      const hasDay = d.attendanceDays.includes(day);
      if (!hasDay) return null;
      return {
        hasClass: true,
        lessonsCount: 0,
        details: [],
      } as WeeklyTeacherDayInfo;
    });

    if (days.some((x) => x !== null)) {
      rows.push({
        teacherId: `deputy-${d.id}`,
        firstName: d.firstName,
        lastName: d.lastName,
        position: d.position || "کادر اجرایی",
        days,
      });
    }
  }

  const teacherRows: WeeklyTeacherRow[] = [];
  for (const agg of teacherMap.values()) {
    const days = WEEK_DAYS.map((day) => {
      const arr = agg.dayMap.get(day);
      if (!arr || arr.length === 0) return null;
      return {
        hasClass: true,
        lessonsCount: arr.length,
        details: arr,
      } as WeeklyTeacherDayInfo;
    });

    if (days.some((x) => x !== null)) {
      teacherRows.push({
        teacherId: `teacher-${agg.teacherId}`,
        firstName: agg.firstName,
        lastName: agg.lastName,
        position: "معلم",
        days,
      });
    }
  }

  teacherRows.sort((a, b) => {
    const ln = a.lastName.localeCompare(b.lastName, "fa");
    if (ln !== 0) return ln;
    return a.firstName.localeCompare(b.firstName, "fa");
  });

  rows.push(...teacherRows);

  const weekDates: (string | null)[] = Array.from({ length: 6 }, () => null);
  if (params?.weekStart) {
    const start = new Date(params.weekStart);
    for (let i = 0; i < 6; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      weekDates[i] = d.toISOString().slice(0, 10);
    }
  }

  return {
    status: "success",
    data: {
      academicYearTitle: academicYear.title,
      schoolTitle: school.title,
      schoolId: school.id,
      weekDates,
      rows,
    },
  };
}
/* ═══════════════════════════════════════════════
   اطلاعات مدرسه برای روکش
   ═══════════════════════════════════════════════ */

export async function getSchoolCoverInfo(): Promise<
  | {
      status: "success";
      data: {
        schoolTitle: string;
        schoolSubTitle: string | null;
        schoolId: number;
        academicYearTitle: string;
        managerName: string | null;
        deputyName: string | null;
        address: string | null;
        phone: string | null;
        doreTitle: string | null;
        teachersCount: number;
      };
    }
  | { status: "error"; error: string }
> {
  const context = await getCurrentContext();
  if (!context?.schoolId || !context.academicYearId) {
    return { status: "error", error: "کانتکست فعال یافت نشد" };
  }

  const { schoolId, academicYearId } = context;

  const [school, academicYear, weekly] = await Promise.all([
    prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        id: true,
        title: true,
        subTitle: true,
        modirName: true,
        doreTahsili: { select: { title: true } },
      },
    }),
    prisma.academicYear.findUnique({
      where: { id: academicYearId },
      select: { title: true },
    }),
    // ⬇⬇ همان تابعی که لیست حضور را می‌سازد
    getWeeklyTeacherAttendance(),
  ]);

  if (!school || !academicYear) {
    return { status: "error", error: "مدرسه یا سال تحصیلی یافت نشد" };
  }

  // تعداد دقیقاً همان چیزی که در لیست حضور می‌آید
  const totalCount =
    weekly.status === "success"
      ? weekly.data.rows.filter((r) =>
          [0, 1, 2, 3, 4].some((i) => r.days[i] !== null),
        ).length
      : 0;

  return {
    status: "success",
    data: {
      schoolTitle: school.title,
      schoolSubTitle: school.subTitle ?? null,
      schoolId: school.id,
      academicYearTitle: academicYear.title,
      managerName: school.modirName ?? null,
      deputyName: null,
      address: null,
      phone: null,
      doreTitle: school.doreTahsili?.title ?? null,
      teachersCount: totalCount, // ⬅️ هماهنگ با لیست حضور
    },
  };
}
