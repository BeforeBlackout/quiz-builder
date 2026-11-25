import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Icon } from "@/components/Icon";
import { ApiError, deleteQuiz, listQuizzes, type QuizSummary } from "@/services/api";

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    listQuizzes()
      .then((rows) => {
        if (active) setQuizzes(rows);
      })
      .catch((caught: unknown) => {
        if (!active) return;
        setError(caught instanceof ApiError ? caught.message : "Could not load quizzes");
        setQuizzes([]);
      });
    return () => {
      active = false;
    };
  }, []);

  async function confirmDelete(id: number) {
    setDeletingId(id);
    setError(null);
    try {
      await deleteQuiz(id);
      setQuizzes((current) => current?.filter((quiz) => quiz.id !== id) ?? []);
      setPendingId(null);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not delete the quiz");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <Head>
        <title>My quizzes · quiz-builder</title>
      </Head>

      <div className="mx-auto flex w-full max-w-[1132px] flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[31px] leading-[1.45] font-semibold tracking-tight">My quizzes</h1>
            <p className="mt-1 text-sm text-muted">
              A home for your ideas, one question at a time.
            </p>
          </div>
          <Link
            href="/create"
            className="inline-flex h-[45px] shrink-0 items-center gap-2.5 rounded-[10px] bg-accent px-[18px] text-sm font-semibold text-card"
          >
            <Icon src="/icons/plus-white.svg" />
            Create quiz
          </Link>
        </div>

        {error ? <p className="text-sm text-accent">{error}</p> : null}

        <div className="overflow-hidden rounded-[12px] border border-line bg-card">
          <div className="hidden grid-cols-[minmax(0,1fr)_130px_72px] gap-4 border-b border-line px-6 py-3 text-[10px] font-semibold tracking-wide text-muted-soft uppercase md:grid">
            <span>Quiz name</span>
            <span>Questions</span>
            <span />
          </div>

          {quizzes === null ? (
            <p className="px-6 py-10 text-sm text-muted">Loading quizzes…</p>
          ) : quizzes.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-lg font-semibold">No quizzes yet</p>
              <p className="mt-2 text-sm text-muted">Create one to get started.</p>
              <Link href="/create" className="mt-4 inline-block text-sm font-semibold text-accent">
                Create a quiz
              </Link>
            </div>
          ) : (
            <ul>
              {quizzes.map((quiz, index) => (
                <li
                  key={quiz.id}
                  className="grid gap-3 border-b border-line px-6 py-6 last:border-b-0 md:grid-cols-[minmax(0,1fr)_130px_72px] md:items-center md:gap-4"
                >
                  <div className="flex min-w-0 items-start gap-3.5">
                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-[10px] ${
                        index === 0 ? "bg-accent-soft" : "bg-paper"
                      }`}
                    >
                      <Icon src={index === 0 ? "/icons/book.svg" : "/icons/book-muted.svg"} />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/quizzes/${quiz.id}`}
                        className="text-[15px] font-semibold hover:text-accent"
                      >
                        {quiz.title}
                      </Link>
                      <p className="mt-1 text-[11px] text-muted md:hidden">
                        {quiz.questionCount} {quiz.questionCount === 1 ? "question" : "questions"}
                      </p>
                    </div>
                  </div>
                  <p className="hidden text-[13px] text-muted md:block">
                    {quiz.questionCount} {quiz.questionCount === 1 ? "question" : "questions"}
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    {pendingId === quiz.id ? (
                      <>
                        <button
                          type="button"
                          className="rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-card disabled:opacity-60"
                          disabled={deletingId === quiz.id}
                          onClick={() => void confirmDelete(quiz.id)}
                        >
                          {deletingId === quiz.id ? "Deleting…" : "Confirm"}
                        </button>
                        <button
                          type="button"
                          className="rounded-full px-3 py-1.5 text-sm text-muted"
                          onClick={() => setPendingId(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        aria-label={`Delete ${quiz.title}`}
                        className="rounded-lg p-2 text-muted hover:bg-paper"
                        onClick={() => setPendingId(quiz.id)}
                      >
                        <Icon src="/icons/trash-row.svg" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
