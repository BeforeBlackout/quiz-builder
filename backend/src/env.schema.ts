import { z } from "zod";

export const envSchema = z.object({
  PORT: z.coerce.number().int().min(0).max(65535).default(3000),
  FRONTEND_ORIGIN: z.url().default("http://localhost:5173"),
});

export type Env = z.infer<typeof envSchema>;
