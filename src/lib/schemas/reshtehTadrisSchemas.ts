import { z } from "zod";
export const createReshtehTadrisSchemas = z.object({
  title: z.string().min(3, { message: " نام رشته تدریس را وارد نمایید" }),
});
export const updateReshtehTadrisSchemas = z.object({
  id: z.string().uuid({ message: "کد رشته تدریس معتبر نیست" }),
  title: z.string().min(3, { message: " نام رشته تدریس را وارد نمایید" }),
});
export type CreateReshtehTadrisSchemas = z.infer<
  typeof createReshtehTadrisSchemas
>;
export type UpdateReshtehTadrisSchemas = z.infer<
  typeof updateReshtehTadrisSchemas
>;
