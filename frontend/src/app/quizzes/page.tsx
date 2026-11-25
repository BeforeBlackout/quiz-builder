import type { Metadata } from "next";
import { connection } from "next/server";

import { listQuizzes } from "@/api/quiz";
import { QuizList } from "@/components/quiz-list/QuizList";
import type { QuizSummary } from "@/types/quiz";
import { getErrorMessage } from "@/utils/api";

export const metadata: Metadata = {
  title: "My quizzes",
  description: "Browse, open and manage all the quizzes you've built.",
};

export default async function QuizzesPage() {
  await connection();

  let quizzes: QuizSummary[];
  try {
    quizzes = await listQuizzes();
  } catch (caught) {
    return (
      <p className="mx-auto w-full max-w-283 text-sm text-accent">
        {getErrorMessage(caught, "Could not load quizzes")}
      </p>
    );
  }

  return <QuizList quizzes={quizzes} />;
}
