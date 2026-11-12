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
      select: { id: true, title: true },
    }),
    prisma.academicYear.findUnique({
      where: { id: academicYearId },
      select: { title: true },
    }),
  ]);

  if (!school || !academicYear) {
    return { status: "error", error: "مدرسه یا سال تحصیلی یافت نشد" };
  }

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

  const rows: WeeklyTeacherRow[] = [];
  for (const agg of teacherMap.values()) {
    const days = WEEK_DAYS.map((d) => {
      const arr = agg.dayMap.get(d);
      if (!arr || arr.length === 0) return null;
      return {
        hasClass: true,
        lessonsCount: arr.length,
        details: arr,
      } as WeeklyTeacherDayInfo;
    });

    if (days.some((d) => d !== null)) {
      rows.push({
        teacherId: agg.teacherId,
        firstName: agg.firstName,
        lastName: agg.lastName,
        days,
      });
    }
  }

  rows.sort((a, b) => {
    const ln = a.lastName.localeCompare(b.lastName, "fa");
    if (ln !== 0) return ln;
    return a.firstName.localeCompare(b.firstName, "fa");
  });

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
