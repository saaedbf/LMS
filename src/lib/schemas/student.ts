import { z } from "zod";

const emptyStringToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const iranMobileRegex = /^09\d{9}$/;
const nationalCodeRegex = /^\d{10}$/;

export const studentSearchSchema = z.object({
  nationalCode: z
    .string()
    .trim()
    .regex(nationalCodeRegex, "کد ملی باید ۱۰ رقم باشد."),
});
export const findStudentByNationalCodeSchema = z.object({
  nationalCode: z
    .string()
    .trim()
    .regex(nationalCodeRegex, "کد ملی باید ۱۰ رقم باشد."),
});

export const createStudentSchema = z.object({
  firstName: z.string().trim().min(1, "نام الزامی است."),
  lastName: z.string().trim().min(1, "نام خانوادگی الزامی است."),
  nationalCode: z
    .string()
    .trim()
    .regex(nationalCodeRegex, "کد ملی باید ۱۰ رقم باشد."),
  phone: z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .trim()
      .regex(iranMobileRegex, "شماره تماس باید با 09 شروع شود و ۱۱ رقمی باشد.")
      .optional(),
  ),
  address: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().min(1, "آدرس نامعتبر است.").optional(),
  ),
  fatherName: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().min(1, "نام پدر نامعتبر است.").optional(),
  ),
});

export const updateStudentSchema = z.object({
  studentId: z.string().trim().min(1, "شناسه دانش‌آموز الزامی است."),
  firstName: z.string().trim().min(1, "نام الزامی است."),
  lastName: z.string().trim().min(1, "نام خانوادگی الزامی است."),
  nationalCode: z
    .string()
    .trim()
    .regex(nationalCodeRegex, "کد ملی باید ۱۰ رقم باشد."),
  phone: z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .trim()
      .regex(iranMobileRegex, "شماره تماس باید با 09 شروع شود و ۱۱ رقمی باشد.")
      .optional(),
  ),
  address: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().min(1, "آدرس نامعتبر است.").optional(),
  ),
  fatherName: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().min(1, "نام پدر نامعتبر است.").optional(),
  ),
});

export const createStudentEnrollmentSchema = z.object({
  studentId: z.string().trim().min(1, "دانش‌آموز الزامی است."),
  schoolId: z.coerce.number().int().positive("مدرسه معتبر نیست."),
  academicYearId: z.coerce.number().int().positive("سال تحصیلی معتبر نیست."),
  payeId: z.coerce.number().int().positive("پایه معتبر نیست."),
  reshtehTahsiliId: z.coerce.number().int().positive("رشته تحصیلی معتبر نیست."),
  klassId: z.string().trim().min(1, "کلاس الزامی است."),
});

export const updateStudentEnrollmentSchema = z.object({
  enrollmentId: z.string().trim().min(1, "شناسه ثبت‌نام الزامی است."),
  payeId: z.coerce.number().int().positive("پایه معتبر نیست."),
  reshtehTahsiliId: z.coerce.number().int().positive("رشته تحصیلی معتبر نیست."),
  klassId: z.string().trim().min(1, "کلاس الزامی است."),
});

export type StudentSearchInput = z.infer<typeof studentSearchSchema>;
export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type CreateStudentEnrollmentInput = z.infer<
  typeof createStudentEnrollmentSchema
>;
export type UpdateStudentEnrollmentInput = z.infer<
  typeof updateStudentEnrollmentSchema
>;
