import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      role: {
        type: "string", // بهتر است اینجا string بماند چون Better Auth با رشته کار می‌کند
        required: false,
        defaultValue: "STUDENT",
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
      },
      // اگر فیلدهای نام و نام خانوادگی را در پریزما اضافه کردید:
      firstName: { type: "string", required: false },
      lastName: { type: "string", required: false },
    },
  },

  secret: process.env.BETTER_AUTH_SECRET,
});
