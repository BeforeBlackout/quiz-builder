import { toQuestionDto, type QuestionDto } from "../questions/question.dto.ts";
import type { FieldOutputTypes } from "../prisma/contract.d.ts";

export type QuizRow = FieldOutputTypes["public"]["Quiz"];

export type QuizSummaryDto = Pick<QuizRow, "id" | "title"> & {
  questionCount: number;
};

export type QuizDetailDto = Pick<QuizRow, "id" | "title"> & {
  createdAt: string;
  updatedAt: string;
  questions: QuestionDto[];
};

export function toQuizSummaryDto(
  row: Pick<QuizRow, "id" | "title"> & { questions: number },
): QuizSummaryDto {
  return {
    id: row.id,
    title: row.title,
    questionCount: row.questions,
  };
}

export function toQuizDetailDto(
  row: Pick<QuizRow, "id" | "title" | "createdAt" | "updatedAt"> & {
    questions: Parameters<typeof toQuestionDto>[0][];
  },
): QuizDetailDto {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    questions: row.questions.map(toQuestionDto),
  };
}
