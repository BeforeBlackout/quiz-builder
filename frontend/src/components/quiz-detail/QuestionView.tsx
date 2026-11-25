import { BooleanView } from "@/components/quiz-detail/BooleanView";
import { CheckboxView } from "@/components/quiz-detail/CheckboxView";
import { InputView } from "@/components/quiz-detail/InputView";
import type { QuestionTypeName } from "@/schemas/quiz-schema";
import type { QuizQuestion } from "@/types/quiz";

const typeLabels: Record<QuestionTypeName, string> = {
  BOOLEAN: "Boolean",
  INPUT: "Input",
  CHECKBOX: "Checkbox",
};

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function QuestionView({ index, question }: { index: number; question: QuizQuestion }) {
  return (
    <section className="rounded-xl border border-line bg-card p-6">
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
        {question.type === "INPUT" ? <InputView answer={question.textAnswer} /> : null}
        {question.type === "CHECKBOX" ? <CheckboxView options={question.options} /> : null}
      </div>
    </section>
  );
}
