// src/actions/weeklyTeacherAttendanceTypes.ts
// ⚠️ این فایل "use server" ندارد — چون فقط type و ثابت دارد

export const WEEK_DAYS = [
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
] as const;

export type WeekDay = (typeof WEEK_DAYS)[number];

export const WEEK_DAYS_FA: Record<WeekDay, string> = {
  SATURDAY: "شنبه",
  SUNDAY: "یکشنبه",
  MONDAY: "دوشنبه",
  TUESDAY: "سه‌شنبه",
  WEDNESDAY: "چهارشنبه",
  THURSDAY: "پنجشنبه",
};

export type WeeklyTeacherDayInfo = {
  hasClass: boolean;
  lessonsCount: number;
  details: Array<{ klassTitle: string; darsTitle: string; bellIndex: number }>;
};

export type WeeklyTeacherRow = {
  teacherId: string;
  firstName: string;
  lastName: string;
  days: (WeeklyTeacherDayInfo | null)[];
};

export type WeeklyAttendanceData = {
  academicYearTitle: string;
  schoolTitle: string;
  schoolId: number;
  weekDates: (string | null)[];
  rows: WeeklyTeacherRow[];
};
