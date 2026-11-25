import { z } from "zod";

import { createQuestionSchema } from "../questions/question.schema.ts";

export const TITLE_MAX = 200;
export const QUESTIONS_MIN = 1;
export const QUESTIONS_MAX = 50;

export const createQuizSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(TITLE_MAX),
  questions: z
    .array(createQuestionSchema)
    .min(QUESTIONS_MIN, "Add at least one question")
    .max(QUESTIONS_MAX),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
