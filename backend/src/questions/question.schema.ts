import { z } from "zod";

import { createOptionSchema } from "../options/option.schema.ts";
import type { FieldOutputTypes } from "../prisma/contract.d.ts";

export const QuestionType = {
  BOOLEAN: "BOOLEAN",
  INPUT: "INPUT",
  CHECKBOX: "CHECKBOX",
} as const;

export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];

export const questionTypes = [
  QuestionType.BOOLEAN,
  QuestionType.INPUT,
  QuestionType.CHECKBOX,
] as const;

export const PROMPT_MAX = 500;
export const TEXT_ANSWER_MAX = 300;
export const CHECKBOX_OPTIONS_MIN = 2;
export const CHECKBOX_OPTIONS_MAX = 12;

const prompt = z.string().trim().min(1, "Question text is required").max(PROMPT_MAX);

const booleanQuestionSchema = z.object({
  type: z.literal(QuestionType.BOOLEAN),
  prompt,
  booleanAnswer: z.boolean(),
});

const inputQuestionSchema = z.object({
  type: z.literal(QuestionType.INPUT),
  prompt,
  textAnswer: z.string().trim().min(1, "Expected answer is required").max(TEXT_ANSWER_MAX),
});

const checkboxQuestionSchema = z
  .object({
    type: z.literal(QuestionType.CHECKBOX),
    prompt,
    options: z
      .array(createOptionSchema)
      .min(CHECKBOX_OPTIONS_MIN, `Add at least ${CHECKBOX_OPTIONS_MIN} options`)
      .max(CHECKBOX_OPTIONS_MAX),
  })
  .refine((question) => question.options.some((option) => option.isCorrect), {
    message: "Mark at least one correct option",
    path: ["options"],
  });

export const createQuestionSchema = z.discriminatedUnion("type", [
  booleanQuestionSchema,
  inputQuestionSchema,
  checkboxQuestionSchema,
]);

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;

type Equal<A, B> = [A, B] extends [B, A] ? true : false;

true satisfies Equal<QuestionType, FieldOutputTypes["public"]["Question"]["type"]>;
true satisfies Equal<QuestionType, CreateQuestionInput["type"]>;
