import { z } from "zod";

// ⬅️ نرمال‌سازی کد ملی
const normalizeNationalCode = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  let str = String(value).trim().replace(/\D/g, "");
  if (str.length === 9) str = "0" + str;
  if (str.length === 8) str = "00" + str;
  return str;
};

// ⬅️ نرمال‌سازی شماره تماس
const normalizePhone = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  let str = String(value).trim().replace(/\D/g, "");
  if (!str) return "";

  if (str.length === 10 && str.startsWith("9")) str = "0" + str;
  if (str.length === 9 && str.startsWith("9")) str = "0" + str;
  if (str.startsWith("98") && str.length === 12) {
    str = "0" + str.substring(2);
  }

  return str;
};

const nationalCodeRegex = /^\d{10}$/;
const iranMobileRegex = /^09\d{9}$/;

export const bulkTeacherRowSchema = z.object({
  firstName: z.string().trim().min(1, "نام الزامی است"),
  lastName: z.string().trim().min(1, "نام خانوادگی الزامی است"),

  nationalCode: z.preprocess(
    normalizeNationalCode,
    z.string().regex(nationalCodeRegex, "کد ملی باید ۱۰ رقم باشد"),
  ),

  personnelCode: z.string().trim().optional(),

  phone: z.preprocess(
    normalizePhone,
    z
      .string()
      .optional()
      .refine((val) => !val || iranMobileRegex.test(val), {
        message: "شماره تماس معتبر نیست (مثال: 09123456789)",
      }),
  ),
});

export const bulkTeachersSchema = z.object({
  teachers: z
    .array(bulkTeacherRowSchema)
    .min(1, "حداقل یک معلم وارد کنید")
    .max(500, "حداکثر ۵۰۰ معلم در هر بار"),
});

export type BulkTeacherRow = z.infer<typeof bulkTeacherRowSchema>;
export type BulkTeachersInput = z.infer<typeof bulkTeachersSchema>;
