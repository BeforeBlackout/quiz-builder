import { Icon } from "@/components/ui/Icon";
import { booleanChoices } from "@/constants/quiz";
import type { QuizQuestionOf } from "@/types/quiz";
import { cx } from "@/utils/cx";

export function BooleanView({ question }: { question: QuizQuestionOf<"BOOLEAN"> }) {
  return (
    <div className="flex flex-wrap gap-3">
      {booleanChoices.map((choice) => {
        const selected = choice.value === question.booleanAnswer;
        return (
          <span
            key={choice.label}
            className={cx(
              "inline-flex items-center gap-2 rounded-md px-3.5 py-2.5 text-[13px] font-medium",
              selected ? "bg-success-soft text-success" : "bg-paper text-muted",
            )}
          >
            <Icon src={selected ? "/icons/check-green.svg" : "/icons/radio-empty.svg"} />
            {choice.label}
            {selected ? <span className="text-[11px] font-normal">· Correct answer</span> : null}
          </span>
        );
      })}
    </div>
  );
}
