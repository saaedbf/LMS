import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createAbsencesSchema = z
  .object({
    enrollmentIds: z.array(z.string().min(1)).min(1, "حداقل یک دانش‌آموز"),
    date: z.string().min(1, "تاریخ الزامی است"),
    isFullDay: z.boolean().default(false),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.isFullDay) return true;
      return !!data.startTime && !!data.endTime;
    },
    {
      message: "در حالت ساعتی، ساعت شروع و پایان الزامی است",
      path: ["startTime"],
    },
  )
  .refine(
    (data) => {
      if (data.isFullDay) return true;
      if (!data.startTime || !data.endTime) return true;
      return data.endTime > data.startTime;
    },
    {
      message: "ساعت پایان باید بعد از ساعت شروع باشد",
      path: ["endTime"],
    },
  );

export type CreateAbsencesSchema = z.infer<typeof createAbsencesSchema>;

export const updateAbsenceScheduleSchema = z
  .object({
    id: z.string().min(1),
    date: z.string().min(1),
    isFullDay: z.boolean().default(false),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.isFullDay) return true;
      return !!data.startTime && !!data.endTime;
    },
    {
      message: "در حالت ساعتی، ساعت شروع و پایان الزامی است",
      path: ["startTime"],
    },
  )
  .refine(
    (data) => {
      if (data.isFullDay) return true;
      if (!data.startTime || !data.endTime) return true;
      return data.endTime > data.startTime;
    },
    {
      message: "ساعت پایان باید بعد از ساعت شروع باشد",
      path: ["endTime"],
    },
  );

export type UpdateAbsenceScheduleSchema = z.infer<
  typeof updateAbsenceScheduleSchema
>;

// بقیه اسکیماها بدون تغییر
export const updateAbsenceSchema = z.object({
  id: z.string().min(1),
  absenceType: z.enum(["UNKNOWN", "EXCUSED", "UNEXCUSED"]),
  reason: z.string().optional().nullable(),
});

export type UpdateAbsenceSchema = z.infer<typeof updateAbsenceSchema>;

export const deleteAbsenceSchema = z.object({
  id: z.string().min(1),
});

export type DeleteAbsenceSchema = z.infer<typeof deleteAbsenceSchema>;
