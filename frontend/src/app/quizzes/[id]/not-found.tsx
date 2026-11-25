import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiz not found",
  description: "This quiz doesn't exist or has been deleted.",
};

export default function QuizNotFound() {
  return (
    <div className="mx-auto w-full max-w-280">
      <h1 className="text-[31px] font-semibold">Quiz not found</h1>
      <p className="mt-2 text-muted">That quiz is not in the database.</p>
      <Link href="/quizzes" className="mt-4 inline-block text-sm font-semibold text-accent">
        Back to quizzes
      </Link>
    </div>
  );
}
