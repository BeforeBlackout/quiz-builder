import { Icon } from "@/components/ui/Icon";
import type { QuizQuestionOf } from "@/types/quiz";
import { cx } from "@/utils/cx";
import { pluralize } from "@/utils/format";

export function CheckboxView({ question }: { question: QuizQuestionOf<"CHECKBOX"> }) {
  const correctOptions = question.options.filter((option) => option.isCorrect).length;

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">
          Answer options
        </p>
        <p className="text-[11px] font-medium text-success">
          {pluralize(correctOptions, "correct answer")}
        </p>
      </div>
      <ul className="grid gap-2">
        {question.options.map((option) => (
          <li
            key={option.id}
            className={cx(
              "flex items-center gap-2.5 rounded-lg px-4.5 py-6",
              option.isCorrect ? "bg-success-soft" : "bg-paper",
            )}
          >
            {option.isCorrect ? (
              <span className="flex size-5 items-center justify-center rounded-sm bg-success">
                <Icon src="/icons/check-on-green.svg" />
              </span>
            ) : (
              <span className="size-5 rounded-sm border border-border-checkbox bg-card" />
            )}
            <span
              className={cx(
                "text-[13px] font-medium",
                option.isCorrect ? "text-success" : "text-muted",
              )}
            >
              {option.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
