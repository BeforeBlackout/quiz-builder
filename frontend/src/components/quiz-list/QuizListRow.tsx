import { HoverPrefetchLink } from "@/components/ui/HoverPrefetchLink";
import { Icon } from "@/components/ui/Icon";
import type { QuizSummary } from "@/types/quiz";
import { cx } from "@/utils/cx";
import { pluralize } from "@/utils/format";

export const quizListColumns = "md:grid-cols-[minmax(0,1fr)_130px_72px]";

type QuizListRowProps = {
  quiz: QuizSummary;
  highlighted: boolean;
  onDelete: () => void;
};

export function QuizListRow({ quiz, highlighted, onDelete }: QuizListRowProps) {
  const questionCount = pluralize(quiz.questionCount, "question");

  return (
    <li
      className={cx(
        "grid gap-3 border-b border-line px-6 py-6 last:border-b-0 md:items-center md:gap-4",
        quizListColumns,
      )}
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <div
          className={cx(
            "flex size-11 shrink-0 items-center justify-center rounded-[10px]",
            highlighted ? "bg-accent-soft" : "bg-paper",
          )}
        >
          <Icon src={highlighted ? "/icons/book.svg" : "/icons/book-muted.svg"} />
        </div>
        <div className="min-w-0">
          <HoverPrefetchLink
            href={`/quizzes/${quiz.id}`}
            className="text-[15px] font-semibold hover:text-accent"
          >
            {quiz.title}
          </HoverPrefetchLink>
          <p className="mt-1 text-[11px] text-muted md:hidden">{questionCount}</p>
        </div>
      </div>
      <p className="hidden text-[13px] text-muted md:block">{questionCount}</p>
      <div className="flex items-center justify-end">
        <button
          type="button"
          aria-label={`Delete ${quiz.title}`}
          className="rounded-lg p-2 text-muted hover:bg-paper"
          onClick={onDelete}
        >
          <Icon src="/icons/trash-row.svg" />
        </button>
      </div>
    </li>
  );
}
