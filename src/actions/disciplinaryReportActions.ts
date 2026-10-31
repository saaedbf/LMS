"use server";

import { prisma } from "@/lib/prisma";
import { getScope } from "@/lib/auth-helpers";
import { isScopeError } from "@/lib/auth-helpers-utils";
import { PERMISSIONS } from "@/lib/permissions";

export type AttendanceDetail = {
  date: Date;
  dayOfWeek: number; // 0=یکشنبه ... 6=شنبه
  isFullDay: boolean;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
  // دروس غیبت‌شده در آن روز (از ClassSchedule)
  lessons: string[];
};

export type DisciplinaryDetail = {
  date: Date;
  startTime: string;
  reason: string;
};

export type EncouragementDetail = {
  date: Date;
  startTime: string;
  reason: string;
  type: string;
};

export type MonthlyStats = {
  month: string; // "1404/07"
  monthLabel: string; // "مهر ۱۴۰۴"
  absence: number;
  tardiness: number;
  disciplinary: number;
};

export type WeekdayStats = {
  day: string; // "شنبه"
  count: number;
};

export type LessonAbsenceStats = {
  lesson: string;
  count: number;
};

export type StudentDisciplinaryReport = {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    fatherName: string | null;
    nationalCode: string;
    phone: string;
    address: string | null;
  };
  school: { title: string };
  academicYear: { title: string };
  klass: { title: string };
  paye: { title: string };
  reshtehTahsili: { title: string };
  summary: {
    absences: number; // روز کامل
    tardiness: number; // غیر روز کامل
    disciplinary: number;
    encouragements: number;
  };
  monthly: MonthlyStats[];
  weekdays: WeekdayStats[];
  lessonAbsences: LessonAbsenceStats[];
  details: {
    absences: AttendanceDetail[];
    tardiness: AttendanceDetail[];
    disciplinary: DisciplinaryDetail[];
    encouragements: EncouragementDetail[];
  };
};

/* ═══════════════════════════════════════════════
   کمکی: تبدیل روز JS به شنبه..جمعه
   ═══════════════════════════════════════════════ */
const WEEKDAY_FA = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه",
];

function getWeekdayFa(date: Date): string {
  // JS: 0=Sunday ... 6=Saturday
  // شنبه=6, یکشنبه=0, دوشنبه=1, ...
  return WEEKDAY_FA[date.getDay()];
}

function toJalaliMonthKey(date: Date): { key: string; label: string } {
  // ۱. یک ساعت به تاریخ اضافه می‌کنیم تا مشکل اختلاف ساعت (UTC) حل شود
  const d = new Date(date);
  d.setHours(d.getHours() + 3);

  // ۲. محاسبه دقیق تاریخ شمسی (الگوریتم ریاضی)
  const gy = d.getFullYear();
  const gm = d.getMonth() + 1;
  const gd = d.getDate();

  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  const gy2 = gy <= 1600 ? gy - 621 : gy - 1600;

  let days =
    365 * gy2 +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];

  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  jy += Math.floor((days - 1) / 365);

  if (days > 365) days = (days - 1) % 365;

  const jm =
    days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);

  // ۳. نام ماه‌ها
  const monthNames = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ];

  const monthLabel = monthNames[jm - 1];

  return {
    key: `${jy}/${String(jm).padStart(2, "0")}`,
    label: `${monthLabel}`,
  };
}

export async function getStudentDisciplinaryReport(
  enrollmentId: string,
): Promise<
  | { status: "ok"; data: StudentDisciplinaryReport }
  | { status: "error"; error: string }
> {
  try {
    const scope = await getScope(PERMISSIONS.MANAGE_DISCIPLINARY);
    if (isScopeError(scope)) {
      return { status: "error", error: scope.error };
    }
    const { schoolId, academicYearId } = scope;

    // ⬇️ ثبت‌نام + دانش‌آموز + کلاس + پایه + رشته + مدرسه + سال
    const enrollment = await prisma.studentEnrollment.findFirst({
      where: {
        id: enrollmentId,
        schoolId,
        academicYearId,
      },
      include: {
        student: true,
        school: true,
        academicYear: true,
        paye: true,
        reshtehTahsili: true,
        klass: true,
      },
    });

    if (!enrollment) {
      return { status: "error", error: "ثبت‌نام یافت نشد" };
    }

    // ⬇️ غیبت‌ها (روز کامل = غیبت، غیر روز کامل = تاخیر)
    const attendances = await prisma.studentAbsence.findMany({
      where: { studentEnrollmentId: enrollmentId },
      orderBy: { date: "asc" },
    });

    // ⬇️ موارد انضباطی
    const disciplinaries = await prisma.studentDisciplinary.findMany({
      where: { studentEnrollmentId: enrollmentId },
      orderBy: { date: "asc" },
    });

    // ⬇️ تشویق‌ها
    const encouragements = await prisma.studentEncouragement.findMany({
      where: { studentEnrollmentId: enrollmentId },
      orderBy: { date: "asc" },
    });

    // ⬇️ برنامه هفتگی کلاس (برای تشخیص درس در روز غیبت)
    const schedules = await prisma.classSchedule.findMany({
      where: {
        classCourse: { klassId: enrollment.klassId },
      },
      include: {
        classCourse: {
          include: {
            darsPayeReshteh: {
              include: { reshtehTadris: true },
            },
          },
        },
      },
    });

    // ⬇️ نگاشت روز هفته (DayOfWeek enum) به شماره JS
    // DayOfWeek: SATURDAY..THURSDAY
    const dayEnumToJs: Record<string, number> = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      SATURDAY: 6,
    };

    // ⬇️ درس‌های هر روز هفته
    const lessonsByWeekday = new Map<number, string[]>();
    for (const s of schedules) {
      const jsDay = dayEnumToJs[s.day];
      if (jsDay === undefined) continue;
      if (!lessonsByWeekday.has(jsDay)) lessonsByWeekday.set(jsDay, []);
      lessonsByWeekday
        .get(jsDay)!
        .push(s.classCourse.darsPayeReshteh.reshtehTadris.title);
    }

    // ⬇️ جداسازی غیبت و تاخیر
    const absences: AttendanceDetail[] = [];
    const tardiness: AttendanceDetail[] = [];

    for (const a of attendances) {
      const detail: AttendanceDetail = {
        date: a.date,
        dayOfWeek: a.date.getDay(),
        isFullDay: a.isFullDay,
        startTime: a.startTime,
        endTime: a.endTime,
        reason: a.reason,
        lessons: lessonsByWeekday.get(a.date.getDay()) ?? [],
      };
      if (a.isFullDay) absences.push(detail);
      else tardiness.push(detail);
    }

    // ⬇️ آمار ماهانه
    const monthlyMap = new Map<string, MonthlyStats>();
    const ensureMonth = (date: Date) => {
      const { key, label } = toJalaliMonthKey(date);
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, {
          month: key,
          monthLabel: label,
          absence: 0,
          tardiness: 0,
          disciplinary: 0,
        });
      }
      return monthlyMap.get(key)!;
    };

    for (const a of absences) ensureMonth(a.date).absence += 1;
    for (const t of tardiness) ensureMonth(t.date).tardiness += 1;
    for (const d of disciplinaries) ensureMonth(d.date).disciplinary += 1;

    const monthly = Array.from(monthlyMap.values()).sort((a, b) =>
      a.month.localeCompare(b.month),
    );

    // ⬇️ آمار روز هفته (فقط غیبت‌ها)
    const weekdayMap = new Map<string, number>();
    for (const a of absences) {
      const day = getWeekdayFa(a.date);
      weekdayMap.set(day, (weekdayMap.get(day) ?? 0) + 1);
    }
    const weekdays = Array.from(weekdayMap.entries()).map(([day, count]) => ({
      day,
      count,
    }));

    // ⬇️ آمار غیبت به تفکیک درس
    const lessonMap = new Map<string, number>();
    for (const a of absences) {
      for (const lesson of a.lessons) {
        lessonMap.set(lesson, (lessonMap.get(lesson) ?? 0) + 1);
      }
    }
    const lessonAbsences = Array.from(lessonMap.entries())
      .map(([lesson, count]) => ({ lesson, count }))
      .sort((a, b) => b.count - a.count);

    return {
      status: "ok",
      data: {
        student: {
          id: enrollment.student.id,
          firstName: enrollment.student.firstName,
          lastName: enrollment.student.lastName,
          fatherName: enrollment.student.fatherName,
          nationalCode: enrollment.student.nationalCode,
          phone: enrollment.student.phone,
          address: enrollment.student.address,
        },
        school: { title: enrollment.school.title },
        academicYear: { title: enrollment.academicYear.title },
        klass: { title: enrollment.klass.title },
        paye: { title: enrollment.paye.title },
        reshtehTahsili: { title: enrollment.reshtehTahsili.title },
        summary: {
          absences: absences.length,
          tardiness: tardiness.length,
          disciplinary: disciplinaries.length,
          encouragements: encouragements.length,
        },
        monthly,
        weekdays,
        lessonAbsences,
        details: {
          absences,
          tardiness,
          disciplinary: disciplinaries.map((d) => ({
            date: d.date,
            startTime: d.startTime,
            reason: d.reason,
          })),
          encouragements: encouragements.map((e) => ({
            date: e.date,
            startTime: e.startTime,
            reason: e.reason,
            type: e.type,
          })),
        },
      },
    };
  } catch (error) {
    console.error("[getStudentDisciplinaryReport]", error);
    return { status: "error", error: "خطا در دریافت کارنامه" };
  }
}
