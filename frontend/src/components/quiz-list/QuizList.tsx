"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { DeleteQuizDialog } from "@/components/quiz-list/DeleteQuizDialog";
import { QuizListRow, quizListColumns } from "@/components/quiz-list/QuizListRow";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import type { QuizSummary } from "@/types/quiz";
import { cx } from "@/utils/cx";

function CreateQuizLink() {
  return (
    <LinkButton href="/create">
      <Icon src="/icons/plus-white.svg" />
      Create quiz
    </LinkButton>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-lg font-semibold">No quizzes yet</p>
      <p className="mt-2 text-sm text-muted">Create one to get started.</p>
      <div className="mt-5 flex justify-center">
        <CreateQuizLink />
      </div>
    </div>
  );
}

export function QuizList({ quizzes }: { quizzes: QuizSummary[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<number | null>(null);
  const pendingQuiz = quizzes.find((quiz) => quiz.id === pendingId) ?? null;

  return (
    <>
      <div className="mx-auto flex w-full max-w-283 flex-col gap-6">
        <PageHeader
          title="My quizzes"
          description="A home for your ideas, one question at a time."
          action={quizzes.length > 0 ? <CreateQuizLink /> : null}
        />

        <Card padded={false} className="overflow-hidden">
          <div
            className={cx(
              "hidden gap-4 border-b border-line px-6 py-3 text-[10px] font-semibold tracking-wide text-muted-soft uppercase md:grid",
              quizListColumns,
            )}
          >
            <span>Quiz name</span>
            <span>Questions</span>
            <span />
          </div>

          {quizzes.length === 0 ? (
            <EmptyState />
          ) : (
            <ul>
              {quizzes.map((quiz, index) => (
                <QuizListRow
                  key={quiz.id}
                  quiz={quiz}
                  highlighted={index === 0}
                  onDelete={() => setPendingId(quiz.id)}
                />
              ))}
            </ul>
          )}
        </Card>
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
