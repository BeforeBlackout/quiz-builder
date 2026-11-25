import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Icon } from "@/components/Icon";
import { QuestionView } from "@/components/quiz-detail/QuestionView";
import { getQuiz } from "@/api/quiz";
import type { QuestionTypeName } from "@/schemas/quiz-schema";
import type { QuizDetail } from "@/types/quiz";
import { ApiError } from "@/utils/api";

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

const QUIZ_ID_MAX = 2_147_483_647;

function parseQuizId(raw: string) {
  if (!/^[1-9]\d*$/.test(raw)) return null;
  const id = Number(raw);
  return id <= QUIZ_ID_MAX ? id : null;
}

async function loadQuiz(rawId: string): Promise<QuizDetail> {
  const id = parseQuizId(rawId);
  if (id === null) notFound();

  try {
    return await getQuiz(id);
  } catch (caught) {
    if (caught instanceof ApiError && caught.status === 404) notFound();
    throw caught;
  }
}

export async function generateMetadata({ params }: PageProps<"/quizzes/[id]">): Promise<Metadata> {
  const { id: rawId } = await params;
  const id = parseQuizId(rawId);
  if (id === null) {
    return { title: "Quiz not found" };
  }

  try {
    const quiz = await getQuiz(id);
    return {
      title: quiz.title,
      description: "Review this quiz's questions and correct answers.",
    };
  } catch (caught) {
    if (caught instanceof ApiError && caught.status === 404) {
      return {
        title: "Quiz not found",
        description: "This quiz doesn't exist or has been deleted.",
      };
    }
    return { title: "Quiz" };
  }
}

export default async function QuizDetailPage({ params }: PageProps<"/quizzes/[id]">) {
  const { id: rawId } = await params;
  const quiz = await loadQuiz(rawId);

  const counts: Record<QuestionTypeName, number> = {
    BOOLEAN: 0,
    INPUT: 0,
    CHECKBOX: 0,
  };
  for (const question of quiz.questions) {
    counts[question.type] += 1;
  }
  const typesUsed = (Object.values(counts) as number[]).filter((count) => count > 0).length;

  return (
    <div className="mx-auto flex w-full max-w-280 flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link
          href="/quizzes"
          className="-mx-2 inline-flex w-fit items-center gap-3 rounded-md px-2 py-1 text-[12px] font-medium text-accent transition-colors hover:bg-accent-soft"
        >
          <Icon src="/icons/back.svg" />
          Back to my quizzes
        </Link>
        <h1 className="text-[31px] leading-[1.45] font-semibold tracking-tight">{quiz.title}</h1>
        <p className="text-[12px] text-muted">
          {quiz.questions.length} {quiz.questions.length === 1 ? "question" : "questions"}
          {"    ·    "}
          Created {formatDate(quiz.createdAt)}
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-lg bg-notice px-4.5 py-3.75">
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
          <section className="rounded-xl border border-line bg-card p-6">
            <div className="flex items-center gap-3">
              <Icon src="/icons/book-overview.svg" />
              <h2 className="text-base font-semibold">Quiz overview</h2>
            </div>
            <div className="mt-5 flex gap-3">
              <div className="w-32">
                <p className="text-[31px] font-semibold leading-none">
                  {pad2(quiz.questions.length)}
                </p>
                <p className="mt-1 text-[11px] text-muted">Questions</p>
              </div>
              <div className="w-32">
                <p className="text-[31px] font-semibold leading-none">{pad2(typesUsed)}</p>
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
                  {counts[key]} {counts[key] === 1 ? "question" : "questions"}
                </span>
              </div>
            ))}
          </section>

          <section className="rounded-lg bg-success-soft p-5.5">
            <div className="flex items-center gap-3">
              <Icon src="/icons/check-tip.svg" />
              <p className="text-[13px] font-semibold text-success">The answer key, at a glance.</p>
            </div>
            <p className="mt-2.5 text-[12px] leading-[1.45] text-success-muted">
              Correct answers are highlighted in green. This view is for reviewing your quiz, not
              taking it.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
