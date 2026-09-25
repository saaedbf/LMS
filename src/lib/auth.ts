import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { admin } from "better-auth/plugins";
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  // ⬅️ اینجا baseURL لازم است
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  // ⬅️ اینجا trustedOrigins لازم است
  trustedOrigins: process.env.TRUSTED_ORIGINS
    ? process.env.TRUSTED_ORIGINS.split(",").map((s) => s.trim())
    : [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://sch7.ir",
        "https://www.sch7.ir",
      ],
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
