import { z } from "zod";

export const schoolSchema = z.object({
  id: z.number().positive({ message: "کد مدرسه را وارد نمایید" }), // اگر می‌خواهی autoincrement باشد، می‌تواند optional باشد
  title: z.string().min(2, { message: "نام مدرسه را وارد نمایید" }),
  subTitle: z.string().optional(),
  modirName: z.string().min(2, { message: "نام مدیر را وارد نمایید" }),
  isActive: z.boolean(),
  sex: z.enum(["Boy", "Girl", "Mixed"], {
    // اگر enum Sex در Prisma این مقادیر را دارد
    message: "جنسیت مدرسه را انتخاب کنید",
  }),
  schoolType: z.enum(["Dolati", "GheireDolati"], {
    message: "نوع مدرسه را انتخاب کنید",
  }),
  doreTahsiliId: z
    .number()
    .positive({ message: "دوره تحصیلی را انتخاب نمایید" }),
});

export type SchoolSchema = z.infer<typeof schoolSchema>;
