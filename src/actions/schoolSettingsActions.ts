// actions/schoolSettingsActions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getScope } from "@/lib/auth-helpers";
import { isScopeError } from "@/lib/auth-helpers-utils";
import { PERMISSIONS } from "@/lib/permissions";
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
  // ⬅️ یک خط جای ۸ خط
  const scope = await getScope(PERMISSIONS.MANAGE_SETTINGS, {
    managerOnly: true,
  });
  if (isScopeError(scope)) return error(scope.error);

  try {
    let settings = await prisma.schoolSettings.findUnique({
      where: { schoolId: scope.schoolId },
    });

    if (!settings) {
      settings = await prisma.schoolSettings.create({
        data: {
          schoolId: scope.schoolId,
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

  // ⬅️ یک خط جای ۸ خط
  const scope = await getScope(PERMISSIONS.MANAGE_SETTINGS, {
    managerOnly: true,
  });
  if (isScopeError(scope)) return error(scope.error);

  try {
    const settings = await prisma.schoolSettings.upsert({
      where: { schoolId: scope.schoolId },
      update: {
        gradingType: parsed.data.gradingType,
        showTuitionInStudentPanel: parsed.data.showTuitionInStudentPanel,
        showDisciplinaryInStudentPanel:
          parsed.data.showDisciplinaryInStudentPanel,
        showAbsencesInStudentPanel: parsed.data.showAbsencesInStudentPanel,
        showReportCardsInStudentPanel:
          parsed.data.showReportCardsInStudentPanel,
        lastEditedByUsername: scope.username,
      },
      create: {
        schoolId: scope.schoolId,
        gradingType: parsed.data.gradingType,
        showTuitionInStudentPanel: parsed.data.showTuitionInStudentPanel,
        showDisciplinaryInStudentPanel:
          parsed.data.showDisciplinaryInStudentPanel,
        showAbsencesInStudentPanel: parsed.data.showAbsencesInStudentPanel,
        showReportCardsInStudentPanel:
          parsed.data.showReportCardsInStudentPanel,
        lastEditedByUsername: scope.username,
      },
    });

    revalidatePath(SETTINGS_ROUTE);
    return success(settings);
  } catch (err) {
    console.error("updateSchoolSettings error:", err);
    return error("خطا در ذخیره تنظیمات");
  }
}
