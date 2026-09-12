import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createDisciplinarySchema = z.object({
  enrollmentIds: z
    .array(z.string().min(1))
    .min(1, "حداقل یک دانش‌آموز را انتخاب کنید"),
  date: z.string().min(1, "تاریخ الزامی است"),
  startTime: z.string().regex(timeRegex, "ساعت شروع باید به فرمت HH:mm باشد"),
  reason: z.string().min(3, "شرح الزامی است"),
});

export type CreateDisciplinarySchema = z.infer<typeof createDisciplinarySchema>;

// ویرایش زمان غیبت (تاریخ و بازه ساعتی)
export const updateDisciplinarySchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1, "تاریخ الزامی است"),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "ساعت شروع نامعتبر است"),
  reason: z.string().min(3, "شرح الزامی است"),
});

export type UpdateDisciplinarySchema = z.infer<typeof updateDisciplinarySchema>;

// حذف غیبت
export const deleteDisciplinarySchema = z.object({
  id: z.string().min(1),
});
export type DeleteDisciplinaryeSchema = z.infer<
  typeof deleteDisciplinarySchema
>;
