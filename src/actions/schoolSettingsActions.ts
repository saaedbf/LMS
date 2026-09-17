// actions/schoolSettingsActions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import { getCurrentContext } from "@/actions/authActions";
import { revalidatePath } from "next/cache";
import { updateSchoolSettingsSchema } from "@/lib/schemas/schoolSettings";

const SETTINGS_ROUTE = "/dashboard/manager/settings";

type ActionSuccess<T> = { status: "success"; data: T };
type ActionError = { status: "error"; error: string };

function success<T>(data: T): ActionSuccess<T> {
  return { status: "success", data };
}

function error(message: string): ActionError {
  return { status: "error", error: message };
}

// ==========================================
// ۱. دریافت تنظیمات مدرسه (یا ایجاد پیش‌فرض)
// ==========================================
export async function getSchoolSettings() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return error("ابتدا وارد حساب کاربری شوید");

  const context = await getCurrentContext();
  if (!context?.schoolId) return error("کانتکست فعال یافت نشد");

  if (context.role !== "MANAGER") return error("دسترسی ندارید");

  try {
    // اگر تنظیمات وجود نداشت، یکی با مقادیر پیش‌فرض بساز
    let settings = await prisma.schoolSettings.findUnique({
      where: { schoolId: context.schoolId },
    });

    if (!settings) {
      settings = await prisma.schoolSettings.create({
        data: {
          schoolId: context.schoolId,
          gradingType: "NUMERIC",
          showTuitionInStudentPanel: true,
          showDisciplinaryInStudentPanel: true,
          showAbsencesInStudentPanel: true,
          showReportCardsInStudentPanel: true,
        },
      });
    }

    return success(settings);
  } catch (err) {
    console.error("getSchoolSettings error:", err);
    return error("خطا در دریافت تنظیمات");
  }
}

// ==========================================
// ۲. به‌روزرسانی تنظیمات مدرسه
// ==========================================
export async function updateSchoolSettings(input: unknown) {
  const parsed = updateSchoolSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message || "داده نامعتبر");
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) return error("ابتدا وارد حساب کاربری شوید");

  const context = await getCurrentContext();
  if (!context?.schoolId) return error("کانتکست فعال یافت نشد");

  if (context.role !== "MANAGER") return error("دسترسی ندارید");

  const username = currentUser.email || currentUser.name || "unknown";

  try {
    const settings = await prisma.schoolSettings.upsert({
      where: { schoolId: context.schoolId },
      update: {
        gradingType: parsed.data.gradingType,
        showTuitionInStudentPanel: parsed.data.showTuitionInStudentPanel,
        showDisciplinaryInStudentPanel:
          parsed.data.showDisciplinaryInStudentPanel,
        showAbsencesInStudentPanel: parsed.data.showAbsencesInStudentPanel,
        showReportCardsInStudentPanel:
          parsed.data.showReportCardsInStudentPanel,
        lastEditedByUsername: username,
      },
      create: {
        schoolId: context.schoolId,
        gradingType: parsed.data.gradingType,
        showTuitionInStudentPanel: parsed.data.showTuitionInStudentPanel,
        showDisciplinaryInStudentPanel:
          parsed.data.showDisciplinaryInStudentPanel,
        showAbsencesInStudentPanel: parsed.data.showAbsencesInStudentPanel,
        showReportCardsInStudentPanel:
          parsed.data.showReportCardsInStudentPanel,
        lastEditedByUsername: username,
      },
    });

    revalidatePath(SETTINGS_ROUTE);
    return success(settings);
  } catch (err) {
    console.error("updateSchoolSettings error:", err);
    return error("خطا در ذخیره تنظیمات");
  }
}
