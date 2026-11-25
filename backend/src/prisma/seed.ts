import type { CreateQuizInput } from "../quizzes/create-quiz.schema.ts";

export const sampleQuiz: CreateQuizInput = {
  title: "A short sample quiz",
  questions: [
    {
      type: "BOOLEAN",
      prompt: "The Pacific Ocean is the largest ocean on Earth.",
      booleanAnswer: true,
    },
    {
      type: "INPUT",
      prompt: "What is the capital of Japan?",
      textAnswer: "Tokyo",
    },
    {
      type: "CHECKBOX",
      prompt: "Which of these are primary colors in the RYB model?",
      options: [
        { text: "Red", isCorrect: true },
        { text: "Blue", isCorrect: true },
        { text: "Green", isCorrect: false },
        { text: "Yellow", isCorrect: true },
      ],
    },
  ],
};
