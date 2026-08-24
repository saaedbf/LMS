import { z } from "zod";

export const schoolRoles = ["MANAGER", "DEPUTY", "TEACHER", "STUDENT"] as const;

const optionalIntFromForm = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }

  return value;
}, z.number().int().positive().optional());

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, "نام حداقل ۲ کاراکتر باشد"),
    lastName: z.string().trim().min(2, "نام خانوادگی حداقل ۲ کاراکتر باشد"),
    email: z.string().trim().email("ایمیل معتبر نیست"),
    password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد"),
    confirmPassword: z.string(),
    schoolId: optionalIntFromForm,
    academicYearId: optionalIntFromForm,
    schoolRole: z.enum(schoolRoles).optional(),
    makeMaster: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "تکرار رمز عبور صحیح نیست",
      });
    }

    const hasAnyAssignment =
      data.schoolId !== undefined ||
      data.academicYearId !== undefined ||
      data.schoolRole !== undefined;

    if (
      hasAnyAssignment &&
      (data.schoolId === undefined ||
        data.academicYearId === undefined ||
        data.schoolRole === undefined)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["schoolRole"],
        message:
          "برای assignment باید مدرسه، سال تحصیلی و نقش کامل انتخاب شوند",
      });
    }
  });

export type RegisterFormInput = z.input<typeof registerSchema>;
export type RegisterInput = z.output<typeof registerSchema>;
