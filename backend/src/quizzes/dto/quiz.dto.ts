export type QuestionTypeName = "BOOLEAN" | "INPUT" | "CHECKBOX";

export type QuizOptionDto = {
  id: number;
  position: number;
  text: string;
  isCorrect: boolean;
};

export type QuizQuestionDto = {
  id: number;
  position: number;
  type: QuestionTypeName;
  prompt: string;
  booleanAnswer: boolean | null;
  textAnswer: string | null;
  options: QuizOptionDto[];
};

export type QuizSummaryDto = {
  id: number;
  title: string;
  questionCount: number;
};

export type QuizDetailDto = {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  questions: QuizQuestionDto[];
};
