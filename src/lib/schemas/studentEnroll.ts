import { z } from "zod";

export const studentCreateEnrollSchema = z.object({
  nationalCode: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "کد ملی باید دقیقاً ۱۰ رقم باشد"),

  studentId: z.string().optional(),

  firstName: z
    .string()
    .trim()
    .min(2, "نام الزامی است")
    .max(100, "نام نامعتبر است"),

  lastName: z
    .string()
    .trim()
    .min(2, "نام خانوادگی الزامی است")
    .max(100, "نام خانوادگی نامعتبر است"),

  fatherName: z
    .string()
    .trim()
    .min(2, "نام پدر الزامی است")
    .max(100, "نام پدر نامعتبر است"),

  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || /^09\d{9}$/.test(val), {
      message: "شماره تماس باید معتبر باشد",
    }),

  address: z.string().trim().optional().or(z.literal("")),

  payeId: z.number().int().positive("پایه الزامی است"), // ✅ تغییر به number

  reshtehTahsiliId: z.number().int().positive("رشته تحصیلی الزامی است"), // ✅ تغییر به number

  klassId: z.string().uuid("کلاس معتبر نیست"),
});

export type StudentCreateEnrollInput = z.infer<
  typeof studentCreateEnrollSchema
>;
