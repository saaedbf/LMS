import { z } from "zod";

const iranMobileRegex = /^09\d{9}$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

export const createDeputySchema = z.object({
  firstName: z.string().trim().min(1, "نام الزامی است"),
  lastName: z.string().trim().min(1, "نام خانوادگی الزامی است"),
  // ⬅️ کد ملی انعطاف‌پذیر (۸ تا ۱۰ رقم، اختیاری)
  nationalCode: z.string().trim().min(4, "نام کاربری حد اقل 4 کاراکتر باشد"),
  phone: z.string().trim().regex(iranMobileRegex, "شماره تماس معتبر نیست"),
  address: z.string().trim().optional(),
  permissions: z.array(z.string()),
});

export type CreateDeputyInput = z.infer<typeof createDeputySchema>;

export const updateDeputySchema = createDeputySchema.extend({
  id: z.string().min(1, "شناسه معاون الزامی است"),
});

export type UpdateDeputyInput = z.infer<typeof updateDeputySchema>;
