"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentContext } from "@/actions/authActions";
import { getAcademicReportData } from "@/actions/academicReportActions";

// تابع کمکی برای پیدا کردن ثبت‌نام دانش‌آموز
async function getStudentEnrollment() {
  const context = await getCurrentContext();
  if (!context?.user || !context.schoolId || !context.academicYearId) {
    return null;
  }

  // استخراج کد ملی از ایمیل کاربر (مثلا 0012345678@lms.local)
  const nationalCode = context.user.email?.split("@")[0];
  if (!nationalCode) return null;

  const student = await prisma.student.findUnique({
    where: { nationalCode },
    include: {
      enrollments: {
        where: {
          schoolId: context.schoolId,
          academicYearId: context.academicYearId,
        },
        take: 1,
      },
    },
  });

  return student?.enrollments[0] || null;
}

// ۱. گرفتن لیست دوره‌ها برای این دانش‌آموز
export async function getStudentGradePeriods() {
  const enrollment = await getStudentEnrollment();
  if (!enrollment) return [];

  const periods = await prisma.gradePeriod.findMany({
    where: {
      schoolId: enrollment.schoolId,
      academicYearId: enrollment.academicYearId,
      isActive: true,
      // فقط دوره‌هایی که برای کلاس این دانش‌آموز درس دارند
      lessonPeriods: {
        some: { klassId: enrollment.klassId },
      },
    },
    select: { id: true, title: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return periods;
}

// ۲. گرفتن اطلاعات کارنامه
export async function getStudentReport(enrollmentId: string, periodId: string) {
  return await getAcademicReportData(enrollmentId, periodId);
}

// ۳. گرفتن شناسه ثبت‌نام
export async function getStudentEnrollmentId() {
  const enrollment = await getStudentEnrollment();
  return enrollment?.id || null;
}
