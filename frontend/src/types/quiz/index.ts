export type QuizSummary = {
  id: number;
  title: string;
  questionCount: number;
};

export type QuizOption = {
  id: number;
  position: number;
  text: string;
  isCorrect: boolean;
};

type QuizQuestionBase = {
  id: number;
  position: number;
  prompt: string;
};

export type QuizQuestion =
  | (QuizQuestionBase & { type: "BOOLEAN"; booleanAnswer: boolean })
  | (QuizQuestionBase & { type: "INPUT"; textAnswer: string })
  | (QuizQuestionBase & { type: "CHECKBOX"; options: QuizOption[] });

export type QuizDetail = {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  questions: QuizQuestion[];
};
