import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import { Icon } from "@/components/Icon";
import { ApiError, getQuiz, type QuizDetail, type QuizQuestion } from "@/services/api";
import type { QuestionTypeName } from "@/services/quiz-schema";

const typeLabels: Record<QuestionTypeName, string> = {
  BOOLEAN: "Boolean",
  INPUT: "Input",
  CHECKBOX: "Checkbox",
};

const indexLabels: Record<QuestionTypeName, string> = {
  BOOLEAN: "True or false",
  INPUT: "Short text answer",
  CHECKBOX: "Multiple correct answers",
};

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function QuizDetailPage() {
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const rawId = router.query.id;
  const id = typeof rawId === "string" ? Number(rawId) : Number.NaN;
  const invalidId = router.isReady && !Number.isInteger(id);

  useEffect(() => {
    if (!router.isReady || !Number.isInteger(id)) return;

    let active = true;
    getQuiz(id)
      .then((result) => {
        if (active) setQuiz(result);
      })
      .catch((caught: unknown) => {
        if (!active) return;
        if (caught instanceof ApiError && caught.status === 404) {
          setNotFound(true);
          return;
        }
        setError(caught instanceof ApiError ? caught.message : "Could not load this quiz");
      });

    return () => {
      active = false;
    };
  }, [router.isReady, id]);

  const overview = useMemo(() => {
    if (!quiz) return null;
    const counts: Record<QuestionTypeName, number> = {
      BOOLEAN: 0,
      INPUT: 0,
      CHECKBOX: 0,
    };
    for (const question of quiz.questions) {
      counts[question.type] += 1;
    }
    const typesUsed = (Object.values(counts) as number[]).filter((count) => count > 0).length;
    return { counts, typesUsed };
  }, [quiz]);

  if (invalidId || notFound) {
    return (
      <>
        <Head>
          <title>Quiz not found · quiz-builder</title>
        </Head>
        <h1 className="text-[31px] font-semibold">Quiz not found</h1>
        <p className="mt-2 text-muted">That quiz is not in the database.</p>
        <Link href="/quizzes" className="mt-4 inline-block text-sm font-semibold text-accent">
          Back to quizzes
        </Link>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{quiz ? `${quiz.title} · quiz-builder` : "Quiz · quiz-builder"}</title>
      </Head>

      <div className="mx-auto flex w-full max-w-[1132px] flex-col gap-6">
        {error ? <p className="text-sm text-accent">{error}</p> : null}
        {!quiz && !error ? <p className="text-muted">Loading quiz…</p> : null}

        {quiz && overview ? (
          <>
            <div className="flex flex-col gap-4">
              <Link
                href="/quizzes"
                className="inline-flex items-center gap-3 text-[12px] font-medium text-muted"
              >
                <Icon src="/icons/back.svg" />
                Back to my quizzes
              </Link>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-[31px] leading-[1.45] font-semibold tracking-tight">
                  {quiz.title}
                </h1>
                <span className="inline-flex shrink-0 items-center gap-3 rounded-[5px] bg-paper px-2.5 py-1 text-[11px] font-medium text-muted">
                  View only
                  <Icon src="/icons/eye.svg" />
                </span>
              </div>
              <p className="text-[12px] text-muted">
                {quiz.questions.length} {quiz.questions.length === 1 ? "question" : "questions"}
                {"    ·    "}
                Created {formatDate(quiz.createdAt)}
                {"    ·    "}
                Last updated {formatDate(quiz.updatedAt)}
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-[8px] bg-notice px-[18px] py-[15px]">
              <Icon src="/icons/eye-notice.svg" />
              <p className="text-[12px] text-notice-text">
                You’re viewing the quiz structure. Questions and answers can’t be changed here.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,780px)_328px] lg:items-start">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Quiz structure</h2>
                  <p className="text-[12px] text-muted">
                    {quiz.questions.length} {quiz.questions.length === 1 ? "question" : "questions"}
                  </p>
                </div>

                <ol className="grid gap-4">
                  {quiz.questions.map((question, index) => (
                    <li key={question.id}>
                      <QuestionView index={index} question={question} />
                    </li>
                  ))}
                </ol>

                <p className="pt-1 text-center text-[11px] text-muted">
                  You’ve reached the end of this quiz.
                </p>
              </div>

              <aside className="grid gap-5">
                <section className="rounded-[12px] border border-line bg-card p-6">
                  <div className="flex items-center gap-3">
                    <Icon src="/icons/book-overview.svg" />
                    <h2 className="text-base font-semibold">Quiz overview</h2>
                  </div>
                  <div className="mt-5 flex gap-3">
                    <div className="w-[125px]">
                      <p className="text-[31px] font-semibold leading-none">
                        {pad2(quiz.questions.length)}
                      </p>
                      <p className="mt-1 text-[11px] text-muted">Questions</p>
                    </div>
                    <div className="w-[125px]">
                      <p className="text-[31px] font-semibold leading-none">
                        {pad2(overview.typesUsed)}
                      </p>
                      <p className="mt-1 text-[11px] text-muted">Question types</p>
                    </div>
                  </div>
                  <div className="my-5 h-px bg-line" />
                  {(
                    [
                      ["BOOLEAN", "Boolean"],
                      ["INPUT", "Input"],
                      ["CHECKBOX", "Checkbox"],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between py-1.5 text-[12px]">
                      <span className="text-muted">{label}</span>
                      <span className="font-medium">
                        {overview.counts[key]}{" "}
                        {overview.counts[key] === 1 ? "question" : "questions"}
                      </span>
                    </div>
                  ))}
                </section>

                <section className="rounded-[12px] border border-line bg-card p-6">
                  <h2 className="text-sm font-semibold">In this quiz</h2>
                  <ul className="mt-4 grid gap-4">
                    {quiz.questions.map((question, index) => (
                      <li key={question.id} className="flex items-center gap-3">
                        <span className="rounded-[5px] bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent">
                          {pad2(index + 1)}
                        </span>
                        <span className="text-[12px] text-muted">{indexLabels[question.type]}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-[10px] bg-success-soft p-[22px]">
                  <div className="flex items-center gap-3">
                    <Icon src="/icons/check-tip.svg" />
                    <p className="text-[13px] font-semibold text-success">
                      The answer key, at a glance.
                    </p>
                  </div>
                  <p className="mt-2.5 text-[12px] leading-[1.45] text-success-muted">
                    Correct answers are highlighted in green. This view is for reviewing your quiz,
                    not taking it.
                  </p>
                </section>
              </aside>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}

function QuestionView({ index, question }: { index: number; question: QuizQuestion }) {
  const correctOptions = question.options.filter((option) => option.isCorrect).length;

  return (
    <section className="rounded-[12px] border border-line bg-card p-[26px]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">
          Question {pad2(index + 1)}
        </p>
        <span className="rounded-[5px] bg-paper px-2.5 py-1 text-[11px] font-medium text-muted">
          {typeLabels[question.type]}
        </span>
      </div>
      <h2 className="mt-5 text-lg font-semibold">{question.prompt}</h2>

      <div className="mt-5">
        {question.type === "BOOLEAN" ? <BooleanView answer={question.booleanAnswer} /> : null}
        {question.type === "INPUT" ? (
          <div className="rounded-[7px] bg-paper px-[18px] py-4">
            <p className="text-[9px] font-semibold tracking-wide text-muted uppercase">
              Expected answer
            </p>
            <p className="mt-1.5 text-sm font-medium">{question.textAnswer}</p>
          </div>
        ) : null}
        {question.type === "CHECKBOX" ? (
          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">
                Answer options
              </p>
              <p className="text-[11px] font-medium text-success">
                {correctOptions} correct {correctOptions === 1 ? "answer" : "answers"}
              </p>
            </div>
            <ul className="grid gap-2">
              {question.options.map((option) => (
                <li
                  key={option.id}
                  className={`flex items-center gap-2.5 rounded-[6px] px-3.5 py-3 ${
                    option.isCorrect ? "bg-success-soft" : "bg-paper"
                  }`}
                >
                  {option.isCorrect ? (
                    <span className="flex size-[18px] items-center justify-center rounded-[4px] bg-success">
                      <Icon src="/icons/check-on-green.svg" />
                    </span>
                  ) : (
                    <span className="size-[18px] rounded-[4px] border border-[#bbc3ce] bg-card" />
                  )}
                  <span
                    className={`text-[13px] font-medium ${
                      option.isCorrect ? "text-success" : "text-muted"
                    }`}
                  >
                    {option.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function BooleanView({ answer }: { answer: boolean | null }) {
  return (
    <div className="flex flex-wrap gap-3">
      {[
        { label: "True", value: true },
        { label: "False", value: false },
      ].map((choice) => {
        const selected = choice.value === answer;
        return (
          <span
            key={choice.label}
            className={`inline-flex items-center gap-2 rounded-[6px] px-3.5 py-2.5 text-[13px] font-medium ${
              selected ? "bg-success-soft text-success" : "bg-paper text-muted"
            }`}
          >
            {selected ? (
              <Icon src="/icons/check-green.svg" />
            ) : (
              <Icon src="/icons/radio-empty.svg" />
            )}
            {choice.label}
            {selected ? <span className="text-[11px] font-normal">· Correct answer</span> : null}
          </span>
        );
      })}
    </div>
  );
}
