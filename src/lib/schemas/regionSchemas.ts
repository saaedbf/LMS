import { z } from "zod";
export const regionSchema = z.object({
  id: z.number().positive({ message: "کد منطقه را وارد نمایید" }),
  title: z.string().min(2, { message: "نام منطقه را وارد نمایید" }),
  ostanId: z.number().positive({ message: "استان را انتخاب نمایید" }),
});
export type RegionSchema = z.infer<typeof regionSchema>;
