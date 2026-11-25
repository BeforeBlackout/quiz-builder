import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { getQuiz } from "@/api/quiz";
import { QuestionView } from "@/components/quiz-detail/QuestionView";
import { Callout } from "@/components/ui/Callout";
import { Icon } from "@/components/ui/Icon";
import { PageTitle } from "@/components/ui/PageHeader";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { questionTypeLabels, questionTypes } from "@/constants/quiz";
import type { QuizDetail } from "@/types/quiz";
import { ApiError } from "@/utils/api";
import { formatDate, pad2, pluralize } from "@/utils/format";
import { countByType, parseQuizId } from "@/utils/quiz";

const fetchQuiz = cache(getQuiz);

function isNotFound(error: unknown) {
  return error instanceof ApiError && error.status === 404;
}

async function loadQuiz(rawId: string): Promise<QuizDetail> {
  const id = parseQuizId(rawId);
  if (id === null) notFound();

  try {
    return await fetchQuiz(id);
  } catch (caught) {
    if (isNotFound(caught)) notFound();
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
    const quiz = await fetchQuiz(id);
    return {
      title: quiz.title,
      description: "Review this quiz's questions and correct answers.",
    };
  } catch (caught) {
    if (isNotFound(caught)) {
      return {
        title: "Quiz not found",
        description: "This quiz doesn't exist or has been deleted.",
      };
    }
    return { title: "Quiz" };
  }
}

function QuizOverview({ quiz }: { quiz: QuizDetail }) {
  const counts = countByType(quiz.questions);
  const typesUsed = Object.values(counts).filter((count) => count > 0).length;

  return (
    <SummaryCard
      title="Quiz overview"
      icon="/icons/book-overview.svg"
      stats={[
        { label: "Questions", value: pad2(quiz.questions.length) },
        { label: "Question types", value: pad2(typesUsed) },
      ]}
      rows={questionTypes.map((type) => ({
        label: questionTypeLabels[type],
        value: pluralize(counts[type], "question"),
      }))}
    />
  );
}

export default async function QuizDetailPage({ params }: PageProps<"/quizzes/[id]">) {
  const { id: rawId } = await params;
  const quiz = await loadQuiz(rawId);
  const questionCount = pluralize(quiz.questions.length, "question");

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
        <PageTitle>{quiz.title}</PageTitle>
        <p className="text-[12px] text-muted">
          {questionCount}
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
            <p className="text-[12px] text-muted">{questionCount}</p>
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
          <QuizOverview quiz={quiz} />
          <Callout tone="success" icon="/icons/check-tip.svg" title="The answer key, at a glance.">
            Correct answers are highlighted in green. This view is for reviewing your quiz, not
            taking it.
          </Callout>
        </aside>
      </div>
    </div>
  );
}
