import { z } from "zod";

const prompt = z.string().trim().min(1, "Question text is required").max(500);

const booleanQuestion = z.object({
  type: z.literal("BOOLEAN"),
  prompt,
  booleanAnswer: z.boolean(),
});

const inputQuestion = z.object({
  type: z.literal("INPUT"),
  prompt,
  textAnswer: z.string().trim().min(1, "Expected answer is required").max(300),
});

const checkboxQuestion = z
  .object({
    type: z.literal("CHECKBOX"),
    prompt,
    options: z
      .array(
        z.object({
          text: z.string().trim().min(1, "Choice text is required").max(200),
          isCorrect: z.boolean(),
        }),
      )
      .min(1, "Add at least one choice")
      .max(12),
  })
  .superRefine((question, context) => {
    if (!question.options.some((option) => option.isCorrect)) {
      context.addIssue({
        code: "custom",
        message: "Mark at least one correct choice",
        path: ["options"],
      });
    }
  });

export const createQuizSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  questions: z
    .array(z.discriminatedUnion("type", [booleanQuestion, inputQuestion, checkboxQuestion]))
    .min(1, "Add at least one question")
    .max(50),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
