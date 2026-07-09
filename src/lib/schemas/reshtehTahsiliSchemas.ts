import { z } from "zod";
export const reshtehTahsiliSchema = z.object({
  id: z.coerce
    .number({
      message: "باید عدد باشد",
    })
    .int("باید عدد صحیح باشد")
    .positive("باید عدد مثبت باشد"),
  title: z.string().min(3, { message: " نام رشته تحصیلی را وارد نمایید" }),
});

export type ReshtehTahsiliSchema = z.infer<typeof reshtehTahsiliSchema>;
