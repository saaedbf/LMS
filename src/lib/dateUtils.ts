// lib/dateUtils.ts
import { toGregorian, toJalaali } from "jalaali-js";

/**
 * تبدیل تاریخ شمسی به میلادی
 * @param date - تاریخ میلادی (Date object)
 * @returns تاریخ میلادی به عنوان Date object
 */
export function convertJalaliToGregorian(date: Date): Date {
  // اگر تاریخ میلادی است، همان را برگردان
  return date;
}

/**
 * تبدیل تاریخ میلادی به شمسی
 * @param date - تاریخ میلادی (Date object)
 * @returns تاریخ شمسی به صورت string
 */
export function convertGregorianToJalali(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const jalali = toJalaali(year, month, day);

  return `${jalali.jy}/${String(jalali.jm).padStart(2, "0")}/${String(jalali.jd).padStart(2, "0")}`;
}

/**
 * Parse کردن تاریخ شمسی و تبدیل به میلادی
 * @param dateStr - تاریخ شمسی به صورت string (مثال: 1402/01/01)
 * @returns تاریخ میلادی به عنوان Date object یا null در صورت نامعتبر بودن
 */
export function parseJalaliDate(dateStr: string): Date | null {
  const match = dateStr.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (!match) return null;

  const year = parseInt(match[1]);
  const month = parseInt(match[2]);
  const day = parseInt(match[3]);

  if (
    year < 1300 ||
    year > 1500 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  try {
    const gregorian = toGregorian(year, month, day);
    return new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
  } catch (error) {
    console.error("Error parsing jalali date:", error);
    return null;
  }
}
