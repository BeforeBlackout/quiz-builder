import type { Metadata } from "next";
import { connection } from "next/server";

import { QuizList } from "@/components/QuizList";
import { listQuizzes } from "@/api/quiz";
import type { QuizSummary } from "@/types/quiz";
import { ApiError } from "@/utils/api";

export const metadata: Metadata = {
  title: "My quizzes",
  description: "Browse, open and manage all the quizzes you've built.",
};

export default async function QuizzesPage() {
  await connection();

  let quizzes: QuizSummary[] = [];
  let error: string | null = null;

  try {
    quizzes = await listQuizzes();
  } catch (caught) {
    error = caught instanceof ApiError ? caught.message : "Could not load quizzes";
  }

  if (error) {
    return <p className="mx-auto w-full max-w-283 text-sm text-accent">{error}</p>;
  }

  return <QuizList quizzes={quizzes} />;
}
