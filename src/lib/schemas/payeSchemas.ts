import { z } from "zod";
export const createPayeSchema = z.object({
  id: z.coerce
    .number({
      message: "باید عدد باشد",
    })
    .int("باید عدد صحیح باشد")
    .positive("باید عدد مثبت باشد"),
  title: z.string().min(3, { message: " نام  پایه را وارد نمایید" }),
});

export type CreatePayeSchema = z.infer<typeof createPayeSchema>;
