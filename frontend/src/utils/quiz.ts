import { questionTypes, type QuestionTypeName } from "@/constants/quiz";
import type {
  CreateQuizFormValues,
  CreateQuizPayload,
  QuestionFormValues,
} from "@/schemas/quiz-schema";

const QUIZ_ID_MAX = 2_147_483_647;

export function parseQuizId(raw: string) {
  if (!/^[1-9]\d*$/.test(raw)) return null;
  const id = Number(raw);
  return id <= QUIZ_ID_MAX ? id : null;
}

export function countByType(questions: ReadonlyArray<{ type?: QuestionTypeName } | undefined>) {
  const counts = Object.fromEntries(questionTypes.map((type) => [type, 0])) as Record<
    QuestionTypeName,
    number
  >;
  for (const question of questions) {
    if (question?.type) counts[question.type] += 1;
  }
  return counts;
}

export function toCreateQuizPayload(value: CreateQuizFormValues): CreateQuizPayload {
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

export function blankQuestion(): QuestionFormValues {
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
