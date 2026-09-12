import { z } from "zod";

// ۱. اسکیمای جستجوی معلم با کد ملی
export const findTeacherByNationalCodeSchema = z.object({
  nationalCode: z
    .string({ message: "کد ملی الزامی است" })
    .regex(/^\d{10}$/, { message: "کد ملی باید ۱۰ رقم باشد" }),
});

// ۲. اسکیمای ایجاد یا ویرایش معلم
export const teacherSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(2, { message: "نام را وارد نمایید" }),
  lastName: z.string().min(2, { message: "نام خانوادگی را وارد نمایید" }),
  nationalCode: z
    .string({ message: "کد ملی را وارد نمایید" })
    .regex(/^\d{10}$/, { message: "کد ملی باید ۱۰ رقم باشد" }),
  phone: z
    .string({ message: "شماره تماس را وارد نمایید" })
    .regex(/^09\d{9}$/, {
      message: "شماره تماس نامعتبر است (مثال: 09123456789)",
    }),
  personnelCode: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

// ۳. اسکیمای انتساب معلم به مدرسه و سال تحصیلی (مشابه studentEnrollment)
export const teacherAssignmentSchema = z.object({
  id: z.string().optional(),
  teacherId: z.string({ message: "شناسه معلم را وارد نمایید" }),
  schoolId: z.number().positive({ message: "مدرسه را انتخاب نمایید" }),
  academicYearId: z
    .number()
    .positive({ message: "سال تحصیلی را انتخاب نمایید" }),
  isActive: z.boolean().default(true),
});

// خروجی تایپ‌های TypeScript با z.infer
export type FindTeacherByNationalCodeSchema = z.infer<
  typeof findTeacherByNationalCodeSchema
>;
export type TeacherSchema = z.infer<typeof teacherSchema>;
export type TeacherAssignmentSchema = z.infer<typeof teacherAssignmentSchema>;
