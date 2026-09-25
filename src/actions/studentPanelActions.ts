"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import { getCurrentContext } from "@/actions/authActions";

type ActionResult<T> =
  | { status: "success"; data: T }
  | { status: "error"; error: string };

// ==========================================
// دریافت اطلاعات پنل دانش‌آموز
// ==========================================
export async function getStudentPanelData(): Promise<
  ActionResult<{
    student: {
      id: string;
      firstName: string;
      lastName: string;
      nationalCode: string;
    };
    enrollment: {
      id: string;
      klassTitle: string;
      payeTitle: string;
      reshtehTahsiliTitle: string;
    } | null;
    settings: {
      showTuitionInStudentPanel: boolean;
      showDisciplinaryInStudentPanel: boolean;
      showAbsencesInStudentPanel: boolean;
      showReportCardsInStudentPanel: boolean;
    };
    counts: {
      absences: number;
      disciplinaries: number;
    };
  }>
> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { status: "error", error: "ابتدا وارد شوید" };
    }

    const context = await getCurrentContext();
    if (!context?.schoolId || !context.academicYearId) {
      return { status: "error", error: "کانتکست فعال یافت نشد" };
    }

    if (context.role !== "STUDENT") {
      return { status: "error", error: "دسترسی ندارید" };
    }

    // پیدا کردن دانش‌آموز از طریق User
    // نکته: دانش‌آموز از طریق ایمیل (nationalCode@lms.local) پیدا می‌شود
    const email = currentUser.email || "";
    const nationalCode = email.split("@")[0];

    const student = await prisma.student.findUnique({
      where: { nationalCode },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        nationalCode: true,
      },
    });

    if (!student) {
      return { status: "error", error: "دانش‌آموز یافت نشد" };
    }

    // پیدا کردن ثبت‌نام در مدرسه و سال جاری
    const enrollment = await prisma.studentEnrollment.findFirst({
      where: {
        studentId: student.id,
        schoolId: context.schoolId,
        academicYearId: context.academicYearId,
      },
      include: {
        klass: { select: { title: true } },
        paye: { select: { title: true } },
        reshtehTahsili: { select: { title: true } },
      },
    });

    // تنظیمات مدرسه
    const settings = await prisma.schoolSettings.findUnique({
      where: { schoolId: context.schoolId },
    });

    // شمارش غیبت‌ها و موارد انضباطی
    let absencesCount = 0;
    let disciplinariesCount = 0;

    if (enrollment) {
      // ⬅️ فقط اگر تنظیمات اجازه بده
      if (settings?.showAbsencesInStudentPanel !== false) {
        absencesCount = await prisma.studentAbsence.count({
          where: { studentEnrollmentId: enrollment.id },
        });
      }

      if (settings?.showDisciplinaryInStudentPanel !== false) {
        disciplinariesCount = await prisma.studentDisciplinary.count({
          where: { studentEnrollmentId: enrollment.id },
        });
      }
    }

    return {
      status: "success",
      data: {
        student,
        enrollment: enrollment
          ? {
              id: enrollment.id,
              klassTitle: enrollment.klass?.title || "-",
              payeTitle: enrollment.paye?.title || "-",
              reshtehTahsiliTitle: enrollment.reshtehTahsili?.title || "-",
            }
          : null,
        settings: {
          showTuitionInStudentPanel:
            settings?.showTuitionInStudentPanel ?? true,
          showDisciplinaryInStudentPanel:
            settings?.showDisciplinaryInStudentPanel ?? true,
          showAbsencesInStudentPanel:
            settings?.showAbsencesInStudentPanel ?? true,
          showReportCardsInStudentPanel:
            settings?.showReportCardsInStudentPanel ?? true,
        },
        counts: {
          absences: absencesCount,
          disciplinaries: disciplinariesCount,
        },
      },
    };
  } catch (error) {
    console.error("getStudentPanelData error:", error);
    return { status: "error", error: "خطا در دریافت اطلاعات" };
  }
}
