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

  // ۱. مدرسه + سال تحصیلی
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

  // ۲. کادر اجرایی
  const deputyAssignments = await prisma.deputyAssignment.findMany({
    where: { schoolId, academicYearId, isActive: true },
    include: {
      deputy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
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
      // اول ترتیب
      const orderDiff = a.attendanceOrder - b.attendanceOrder;
      if (orderDiff !== 0) return orderDiff;
      // بعد نام خانوادگی
      const ln = a.lastName.localeCompare(b.lastName, "fa");
      if (ln !== 0) return ln;
      // بعد نام
      return a.firstName.localeCompare(b.firstName, "fa");
    });

  const deputyIds = new Set(deputies.map((d) => d.id));

  // ۳. معلمان (با برنامه هفتگی)
  const klasses = await prisma.klass.findMany({
    where: { schoolId, academicYearId },
    select: {
      id: true,
      title: true,
      classCourses: {
        select: {
          id: true,
          teacher: {
            select: { id: true, firstName: true, lastName: true },
          },
          darsPayeReshteh: {
            select: { reshtehTadris: { select: { title: true } } },
          },
          schedules: { select: { day: true, bellIndex: true } },
        },
      },
    },
  });

  // تجمیع معلمان بر اساس id
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
      if (deputyIds.has(t.id)) continue; // ⬅️ اگر در کادر اجرایی است، رد کن

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

  // ۴. ساخت ردیف‌ها
  const rows: WeeklyTeacherRow[] = [];

  // ⬅️ ۴.۱ مدیر — با همه روزهای حضور (چون روزهای حضور مدیر تعریف نشده، همه روزها)
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

  // ⬅️ ۴.۲ کادر اجرایی — با روزهای حضورشان
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

    // فقط اگر حداقل یک روز حضور دارد
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

  // ⬅️ ۴.۳ معلمان — با روزهای درسشان
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

  // سورت معلمان بر اساس نام خانوادگی
  teacherRows.sort((a, b) => {
    const ln = a.lastName.localeCompare(b.lastName, "fa");
    if (ln !== 0) return ln;
    return a.firstName.localeCompare(b.firstName, "fa");
  });

  rows.push(...teacherRows);

  // ۵. تاریخ‌های هفته
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

  const [school, academicYear, teachersCount] = await Promise.all([
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
    prisma.teacherAssignment.count({
      where: { schoolId, academicYearId, isActive: true },
    }),
  ]);

  if (!school || !academicYear) {
    return { status: "error", error: "مدرسه یا سال تحصیلی یافت نشد" };
  }

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
      teachersCount,
    },
  };
}
