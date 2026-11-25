import type { CreateQuizPayload } from "@/schemas/quiz-schema";
import type { QuizDetail, QuizSummary } from "@/types/quiz";
import { request } from "@/utils/api";

export function listQuizzes() {
  return request<QuizSummary[]>("/quizzes");
}

export function getQuiz(id: number) {
  return request<QuizDetail>(`/quizzes/${id}`);
}

export function createQuiz(payload: CreateQuizPayload) {
  return request<QuizDetail>("/quizzes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteQuiz(id: number) {
  return request<void>(`/quizzes/${id}`, { method: "DELETE" });
}
