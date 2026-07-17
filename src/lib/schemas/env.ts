// lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  PAGE_SIZE: z.string().default("10"),
});

export const env = envSchema.parse({
  PAGE_SIZE: process.env.PAGE_SIZE,
});

export const PAGE_SIZE = Number(env.PAGE_SIZE);
