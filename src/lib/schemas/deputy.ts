import { z } from "zod";

export const DAYS = [
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
] as const;

export type AttendanceDay = (typeof DAYS)[number];

const iranMobileRegex = /^09\d{9}$/;

export const createDeputySchema = z.object({
  firstName: z.string().trim().min(1, "نام الزامی است"),
  lastName: z.string().trim().min(1, "نام خانوادگی الزامی است"),
  nationalCode: z.string().trim().min(4, "نام کاربری حداقل ۴ کاراکتر باشد"),
  phone: z.string().trim().regex(iranMobileRegex, "شماره تماس معتبر نیست"),
  address: z.string().trim().optional(),
  position: z.string().optional().or(z.literal("")),
  attendanceOrder: z.coerce.number().int().min(0).default(0),
  attendanceDays: z.array(z.enum(DAYS)).default([]),
  permissions: z.array(z.string()),
});

export type CreateDeputyInput = z.infer<typeof createDeputySchema>;

export const updateDeputySchema = createDeputySchema.extend({
  id: z.string().min(1, "شناسه کادر اجرایی الزامی است"),
});

export type UpdateDeputyInput = z.infer<typeof updateDeputySchema>;
