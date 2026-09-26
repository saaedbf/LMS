import { z } from "zod";

export const schoolSchema = z.object({
  id: z.number().positive({ message: "کد مدرسه را وارد نمایید" }),
  title: z.string().min(2, { message: "نام مدرسه را وارد نمایید" }),
  subTitle: z.string().optional(),
  modirName: z.string().min(2, { message: "نام مدیر را وارد نمایید" }),
  isActive: z.boolean(),
  sex: z.enum(["Boy", "Girl", "Mixed"], {
    message: "جنسیت مدرسه را انتخاب کنید",
  }),
  schoolType: z.enum(["Dolati", "GheireDolati"], {
    message: "نوع مدرسه را انتخاب کنید",
  }),
  doreTahsiliId: z
    .number()
    .positive({ message: "دوره تحصیلی را انتخاب نمایید" }),

  // ⬅️ جدید
  oppositeSchoolId: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional()
    .or(z.literal(0).transform(() => null)),
});

export type SchoolSchema = z.infer<typeof schoolSchema>;
