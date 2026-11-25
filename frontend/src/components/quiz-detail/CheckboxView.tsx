import { Icon } from "@/components/Icon";
import type { QuizOption } from "@/types/quiz";

export function CheckboxView({ options }: { options: QuizOption[] }) {
  const correctOptions = options.filter((option) => option.isCorrect).length;

  return (
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
        {options.map((option) => (
          <li
            key={option.id}
            className={`flex items-center gap-2.5 rounded-lg px-4.5 py-6 ${
              option.isCorrect ? "bg-success-soft" : "bg-paper"
            }`}
          >
            {option.isCorrect ? (
              <span className="flex size-5 items-center justify-center rounded-sm bg-success">
                <Icon src="/icons/check-on-green.svg" />
              </span>
            ) : (
              <span className="size-5 rounded-sm border border-[#bbc3ce] bg-card" />
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
  );
}
