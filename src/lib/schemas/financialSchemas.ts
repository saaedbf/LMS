import { z } from "zod";

const debtTypeEnum = z.enum([
  "TUITION",
  "SCHOOL_HELP",
  "KLASS_TAGHVIATY", // ⬅️ اضافه شد
  "KLASS_ADVANVE", // ⬅️ اضافه شد
  "BOOK",
  "INSURANCE",
  "BOOK_INSURANCE",
  "TRIP",
  "SCHOOL_SERVICE",
  "OTHER",
]);

const paymentMethodEnum = z.enum([
  "POS",
  "CARD_TO_CARD",
  "TRANSFER",
  "CASH",
  "CHECK",
  "OTHER",
]);

// ⬅️ ایجاد بدهکاری
export const createDebtSchema = z.object({
  enrollmentIds: z
    .array(z.string().min(1))
    .min(1, "حداقل یک دانش‌آموز انتخاب کنید"),
  debtType: debtTypeEnum,
  date: z.string().min(1, "تاریخ الزامی است"),
  description: z.string().trim().optional(),
  amount: z.coerce
    .number()
    .positive("مبلغ باید بیشتر از صفر باشد")
    .int("مبلغ باید عدد صحیح باشد"),
});

export type CreateDebtSchema = z.infer<typeof createDebtSchema>;

// ⬅️ ایجاد پرداخت
export const createPaymentSchema = z.object({
  enrollmentIds: z
    .array(z.string().min(1))
    .min(1, "حداقل یک دانش‌آموز انتخاب کنید"),
  paymentMethod: paymentMethodEnum,
  date: z.string().min(1, "تاریخ الزامی است"),
  description: z.string().trim().optional(),
  amount: z.coerce
    .number()
    .positive("مبلغ باید بیشتر از صفر باشد")
    .int("مبلغ باید عدد صحیح باشد"),
});

export type CreatePaymentSchema = z.infer<typeof createPaymentSchema>;

// ⬅️ ویرایش
export const updateFinancialTransactionSchema = z.object({
  id: z.string().min(1),
  debtType: debtTypeEnum.optional(),
  paymentMethod: paymentMethodEnum.optional(),
  date: z.string().min(1, "تاریخ الزامی است"),
  description: z.string().trim().optional(),
  amount: z.coerce
    .number()
    .positive("مبلغ باید بیشتر از صفر باشد")
    .int("مبلغ باید عدد صحیح باشد"),
});

export type UpdateFinancialTransactionSchema = z.infer<
  typeof updateFinancialTransactionSchema
>;

// ⬅️ حذف
export const deleteFinancialTransactionSchema = z.object({
  id: z.string().min(1),
});

export type DeleteFinancialTransactionSchema = z.infer<
  typeof deleteFinancialTransactionSchema
>;
