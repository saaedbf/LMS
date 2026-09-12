import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createAbsencesSchema = z
  .object({
    enrollmentIds: z
      .array(z.string().min(1))
      .min(1, "حداقل یک دانش‌آموز را انتخاب کنید"),
    date: z.string().min(1, "تاریخ الزامی است"),
    startTime: z.string().regex(timeRegex, "ساعت شروع باید به فرمت HH:mm باشد"),
    endTime: z.string().regex(timeRegex, "ساعت پایان باید به فرمت HH:mm باشد"),
  })
  .refine(
    (data) => {
      if (!timeRegex.test(data.startTime) || !timeRegex.test(data.endTime))
        return true;
      return data.endTime > data.startTime;
    },
    { message: "ساعت پایان باید بعد از ساعت شروع باشد", path: ["endTime"] },
  );

export type CreateAbsencesSchema = z.infer<typeof createAbsencesSchema>;

export const updateAbsenceSchema = z.object({
  id: z.string().min(1),
  absenceType: z.enum(["UNKNOWN", "EXCUSED", "UNEXCUSED"]),
  reason: z.string().max(500).optional().nullable(),
});
// ویرایش زمان غیبت (تاریخ و بازه ساعتی)
export const updateAbsenceScheduleSchema = z
  .object({
    id: z.string().min(1),
    date: z.string().min(1, "تاریخ الزامی است"),
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "ساعت شروع نامعتبر است"),
    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "ساعت پایان نامعتبر است"),
  })
  .refine((d) => d.endTime > d.startTime, {
    message: "ساعت پایان باید بعد از ساعت شروع باشد",
    path: ["endTime"],
  });
export type UpdateAbsenceScheduleSchema = z.infer<
  typeof updateAbsenceScheduleSchema
>;

// حذف غیبت
export const deleteAbsenceSchema = z.object({
  id: z.string().min(1),
});
export type DeleteAbsenceSchema = z.infer<typeof deleteAbsenceSchema>;

export type UpdateAbsenceSchema = z.infer<typeof updateAbsenceSchema>;
