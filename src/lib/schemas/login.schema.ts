import { z } from "zod";

export const LoginSchema = z.object({
  username: z
    .string()
    .min(3, "نام کاربری الزامی است"),

  password: z
    .string()
    .min(4, "رمز عبور باید حداقل 4 کاراکتر باشد"),
});

export type LoginInput = z.infer<typeof LoginSchema>;