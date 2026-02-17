import { z } from "zod";
export const createDorehSchema = z.object({
  id: z.coerce
    .number({
      message: "باید عدد باشد",
    })
    .int("باید عدد صحیح باشد")
    .positive("باید عدد مثبت باشد"),
  title: z.string().min(3, { message: " نام دوره تحصیلی را وارد نمایید" }),
});

export type CreateDorehSchema = z.infer<typeof createDorehSchema>;
