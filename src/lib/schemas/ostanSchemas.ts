import { z } from "zod";
export const ostanSchemas = z.object({
  id: z.coerce
    .number({
      message: "باید عدد باشد",
    })
    .int("باید عدد صحیح باشد")
    .positive("باید عدد مثبت باشد"),
  title: z.string().min(3, { message: " نام  استان را وارد نمایید" }),
});

export type OstanSchemas = z.infer<typeof ostanSchemas>;
