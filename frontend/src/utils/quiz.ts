import type { CreateQuizForm, CreateQuizPayload } from "@/schemas/quiz-schema";

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
