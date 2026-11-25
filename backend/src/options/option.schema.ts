import { z } from "zod";

export const OPTION_TEXT_MAX = 200;

export const createOptionSchema = z.object({
  text: z.string().trim().min(1, "Option text is required").max(OPTION_TEXT_MAX),
  isCorrect: z.boolean(),
});

export type CreateOptionInput = z.infer<typeof createOptionSchema>;
