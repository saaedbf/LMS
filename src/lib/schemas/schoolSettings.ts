// lib/schemas/schoolSettings.ts
import { z } from "zod";

export const updateSchoolSettingsSchema = z.object({
  gradingType: z.enum(["DESCRIPTIVE", "NUMERIC"]),
  showTuitionInStudentPanel: z.boolean(),
  showDisciplinaryInStudentPanel: z.boolean(),
  showAbsencesInStudentPanel: z.boolean(),
  showReportCardsInStudentPanel: z.boolean(),
});

// ⬅️ این دو نوع را جداگانه صادر کنید
export type UpdateSchoolSettingsInput = z.input<
  typeof updateSchoolSettingsSchema
>;
export type UpdateSchoolSettingsOutput = z.output<
  typeof updateSchoolSettingsSchema
>;
