import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { admin } from "better-auth/plugins";
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin()],
  user: {
    additionalFields: {
      // این‌ها ویژگی‌های هویتی/پروفایلی کاربر هستند
      isActive: { type: "boolean", required: false, defaultValue: true },
      firstName: { type: "string", required: false },
      lastName: { type: "string", required: false },
      systemRole: { type: "string", required: false },

      // role را اینجا نمی‌گذاریم چون نقش وابسته به مدرسه/سال است
    },
  },

  secret: process.env.BETTER_AUTH_SECRET,
});
