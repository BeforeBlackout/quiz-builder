"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { DeleteQuizDialog } from "@/components/DeleteQuizDialog";
import { HoverPrefetchLink } from "@/components/HoverPrefetchLink";
import { Icon } from "@/components/Icon";
import type { QuizSummary } from "@/types/quiz";

function CreateQuizLink() {
  return (
    <Link
      href="/create"
      className="inline-flex h-11.25 shrink-0 items-center gap-2.5 rounded-[10px] bg-accent px-4.5 text-sm font-semibold text-card"
    >
      <Icon src="/icons/plus-white.svg" />
      Create quiz
    </Link>
  );
}

export function QuizList({ quizzes }: { quizzes: QuizSummary[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<number | null>(null);
  const pendingQuiz = quizzes.find((quiz) => quiz.id === pendingId) ?? null;

  return (
    <>
      <div className="mx-auto flex w-full max-w-283 flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[31px] leading-[1.45] font-semibold tracking-tight">My quizzes</h1>
            <p className="mt-1 text-sm text-muted">
              A home for your ideas, one question at a time.
            </p>
          </div>
          {quizzes.length > 0 ? <CreateQuizLink /> : null}
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <div className="hidden grid-cols-[minmax(0,1fr)_130px_72px] gap-4 border-b border-line px-6 py-3 text-[10px] font-semibold tracking-wide text-muted-soft uppercase md:grid">
            <span>Quiz name</span>
            <span>Questions</span>
            <span />
          </div>

          {quizzes.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-lg font-semibold">No quizzes yet</p>
              <p className="mt-2 text-sm text-muted">Create one to get started.</p>
              <div className="mt-5 flex justify-center">
                <CreateQuizLink />
              </div>
            </div>
          ) : (
            <ul>
              {quizzes.map((quiz, index) => (
                <li
                  key={quiz.id}
                  className="grid gap-3 border-b border-line px-6 py-6 last:border-b-0 md:grid-cols-[minmax(0,1fr)_130px_72px] md:items-center md:gap-4"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-[10px] ${
                        index === 0 ? "bg-accent-soft" : "bg-paper"
                      }`}
                    >
                      <Icon src={index === 0 ? "/icons/book.svg" : "/icons/book-muted.svg"} />
                    </div>
                    <div className="min-w-0">
                      <HoverPrefetchLink
                        href={`/quizzes/${quiz.id}`}
                        className="text-[15px] font-semibold hover:text-accent"
                      >
                        {quiz.title}
                      </HoverPrefetchLink>
                      <p className="mt-1 text-[11px] text-muted md:hidden">
                        {quiz.questionCount} {quiz.questionCount === 1 ? "question" : "questions"}
                      </p>
                    </div>
                  </div>
                  <p className="hidden text-[13px] text-muted md:block">
                    {quiz.questionCount} {quiz.questionCount === 1 ? "question" : "questions"}
                  </p>
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      aria-label={`Delete ${quiz.title}`}
                      className="rounded-lg p-2 text-muted hover:bg-paper"
                      onClick={() => setPendingId(quiz.id)}
                    >
                      <Icon src="/icons/trash-row.svg" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {pendingQuiz ? (
        <DeleteQuizDialog
          quizId={pendingQuiz.id}
          title={pendingQuiz.title}
          onCancel={() => setPendingId(null)}
          onDeleted={() => {
            setPendingId(null);
            router.refresh();
          }}
        />
      ) : null}
    </>
  );
}
