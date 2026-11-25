import { z } from "zod";

export const questionTypes = ["BOOLEAN", "INPUT", "CHECKBOX"] as const;

export type QuestionTypeName = (typeof questionTypes)[number];

const optionSchema = z.object({
  text: z.string().max(200, "Keep each choice under 200 characters"),
  isCorrect: z.boolean(),
});

const questionSchema = z.object({
  type: z.enum(questionTypes),
  prompt: z.string().max(500, "Keep the question under 500 characters"),
  booleanAnswer: z.boolean(),
  textAnswer: z.string().max(300, "Keep the answer under 300 characters"),
  options: z.array(optionSchema).max(12, "Use at most 12 choices"),
});

export const createQuizFormSchema = z
  .object({
    title: z.string().max(200, "Keep the title under 200 characters"),
    questions: z.array(questionSchema).min(1, "Add at least one question").max(50),
  })
  .superRefine((value, context) => {
    if (value.title.trim().length === 0) {
      context.addIssue({
        code: "custom",
        message: "Title is required",
        path: ["title"],
      });
    }

    value.questions.forEach((question, index) => {
      if (question.prompt.trim().length === 0) {
        context.addIssue({
          code: "custom",
          message: "Write the question",
          path: ["questions", index, "prompt"],
        });
      }

      if (question.type === "INPUT" && question.textAnswer.trim().length === 0) {
        context.addIssue({
          code: "custom",
          message: "Add the expected answer",
          path: ["questions", index, "textAnswer"],
        });
      }

      if (question.type === "CHECKBOX") {
        const filled = question.options.filter((option) => option.text.trim().length > 0);
        if (filled.length < 1) {
          context.addIssue({
            code: "custom",
            message: "Add at least one choice",
            path: ["questions", index, "options"],
          });
        } else if (!filled.some((option) => option.isCorrect)) {
          context.addIssue({
            code: "custom",
            message: "Mark at least one correct choice",
            path: ["questions", index, "options"],
          });
        }
      }
    });
  });

export type CreateQuizForm = z.infer<typeof createQuizFormSchema>;

export type CreateQuizPayload = {
  title: string;
  questions: Array<
    | { type: "BOOLEAN"; prompt: string; booleanAnswer: boolean }
    | { type: "INPUT"; prompt: string; textAnswer: string }
    | {
        type: "CHECKBOX";
        prompt: string;
        options: Array<{ text: string; isCorrect: boolean }>;
      }
  >;
};

export function toCreateQuizPayload(value: CreateQuizForm): CreateQuizPayload {
  return {
    title: value.title.trim(),
    questions: value.questions.map((question) => {
      const prompt = question.prompt.trim();
      if (question.type === "BOOLEAN") {
        return { type: "BOOLEAN", prompt, booleanAnswer: question.booleanAnswer };
      }
      if (question.type === "INPUT") {
        return { type: "INPUT", prompt, textAnswer: question.textAnswer.trim() };
      }
      return {
        type: "CHECKBOX",
        prompt,
        options: question.options
          .filter((option) => option.text.trim().length > 0)
          .map((option) => ({ text: option.text.trim(), isCorrect: option.isCorrect })),
      };
    }),
  };
}

export function blankQuestion(): CreateQuizForm["questions"][number] {
  return {
    type: "BOOLEAN",
    prompt: "",
    booleanAnswer: true,
    textAnswer: "",
    options: [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
    ],
  };
}
