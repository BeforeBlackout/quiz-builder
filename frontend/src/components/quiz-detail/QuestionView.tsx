import type { ComponentType } from "react";

import { BooleanView } from "@/components/quiz-detail/BooleanView";
import { CheckboxView } from "@/components/quiz-detail/CheckboxView";
import { InputView } from "@/components/quiz-detail/InputView";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { questionTypeLabels, type QuestionTypeName } from "@/constants/quiz";
import type { QuizQuestion, QuizQuestionOf } from "@/types/quiz";
import { pad2 } from "@/utils/format";

const answerViews: {
  [T in QuestionTypeName]: ComponentType<{ question: QuizQuestionOf<T> }>;
} = {
  BOOLEAN: BooleanView,
  INPUT: InputView,
  CHECKBOX: CheckboxView,
};

function AnswerView({ question }: { question: QuizQuestion }) {
  const View = answerViews[question.type] as ComponentType<{ question: QuizQuestion }>;
  return <View question={question} />;
}

export function QuestionView({ index, question }: { index: number; question: QuizQuestion }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">
          Question {pad2(index + 1)}
        </p>
        <Badge>{questionTypeLabels[question.type]}</Badge>
      </div>
      <h2 className="mt-5 text-lg font-semibold">{question.prompt}</h2>

      <div className="mt-5">
        <AnswerView question={question} />
      </div>
    </Card>
  );
}
