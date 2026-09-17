// lib/schemas/gradePeriod.ts
import { z } from "zod";

export const createGradePeriodSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "عنوان دوره الزامی است")
    .max(100, "عنوان نامعتبر است"),

  description: z.string().trim().max(500).optional(),

  startDate: z.string().trim().optional(),

  endDate: z.string().trim().optional(),

  isActive: z.boolean().default(true),

  klassIds: z.array(z.string().min(1)).min(1, "حداقل یک کلاس را انتخاب کنید"),

  // ⬅️ تغییر: دروس بر اساس پایه
  lessonsByPaye: z
    .array(
      z.object({
        payeId: z.number().int().positive(),
        lessonIds: z
          .array(z.string().min(1))
          .min(1, "حداقل یک درس برای این پایه انتخاب کنید"),
      }),
    )
    .min(1, "حداقل یک درس انتخاب کنید"),
});

export const updateGradePeriodSchema = createGradePeriodSchema.extend({
  id: z.string().min(1, "شناسه دوره الزامی است"),
});

export type CreateGradePeriodInput = z.input<typeof createGradePeriodSchema>;
export type CreateGradePeriodOutput = z.output<typeof createGradePeriodSchema>;
export type UpdateGradePeriodInput = z.input<typeof updateGradePeriodSchema>;
export type UpdateGradePeriodOutput = z.output<typeof updateGradePeriodSchema>;
