import { z } from "zod";

// ⬅️ تابع نرمال‌سازی کد ملی
const normalizeNationalCode = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  let str = String(value).trim();

  // حذف کاراکترهای غیرعددی
  str = str.replace(/\D/g, "");

  // اگر ۹ رقم است، یک صفر به ابتدا اضافه کن
  if (str.length === 9) {
    str = "0" + str;
  }

  // اگر ۸ رقم است، دو صفر اضافه کن
  if (str.length === 8) {
    str = "00" + str;
  }

  return str;
};

// ⬅️ تابع نرمال‌سازی موبایل
const normalizePhone = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  let str = String(value).trim();

  // حذف کاراکترهای غیرعددی
  str = str.replace(/\D/g, "");

  // اگر خالی بود، برگردان
  if (!str) return "";

  // اگر با ۹ شروع شود (۱۰ رقم بدون صفر اول)
  if (str.length === 10 && str.startsWith("9")) {
    str = "0" + str;
  }

  // اگر ۹ رقم است
  if (str.length === 9 && str.startsWith("9")) {
    str = "0" + str;
  }

  // اگر ۱۱ رقم و با ۰۹ شروع شود، درست است
  // اگر با +98 یا 98 شروع شود، تبدیل کن
  if (str.startsWith("98") && str.length === 12) {
    str = "0" + str.substring(2);
  }

  return str;
};

const nationalCodeRegex = /^\d{10}$/;
const iranMobileRegex = /^09\d{9}$/;

export const bulkStudentRowSchema = z.object({
  firstName: z.string().trim().min(1, "نام الزامی است"),
  lastName: z.string().trim().min(1, "نام خانوادگی الزامی است"),

  // ⬅️ نرمال‌سازی کد ملی
  nationalCode: z.preprocess(
    normalizeNationalCode,
    z.string().regex(nationalCodeRegex, "کد ملی باید ۱۰ رقم باشد"),
  ),

  fatherName: z.string().trim().optional(),

  // ⬅️ نرمال‌سازی موبایل
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

export const bulkStudentsSchema = z.object({
  klassId: z.string().min(1, "کلاس مقصد الزامی است"),
  students: z
    .array(bulkStudentRowSchema)
    .min(1, "حداقل یک دانش‌آموز وارد کنید")
    .max(500, "حداکثر ۵۰۰ دانش‌آموز در هر بار"),
});

export type BulkStudentRow = z.infer<typeof bulkStudentRowSchema>;
export type BulkStudentsInput = z.infer<typeof bulkStudentsSchema>;
