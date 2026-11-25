"use client";

import type { ComponentType } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { BooleanAnswerField } from "@/components/quiz-form/BooleanAnswerField";
import { CheckboxOptionsField } from "@/components/quiz-form/CheckboxOptionsField";
import { TextAnswerField } from "@/components/quiz-form/TextAnswerField";
import { useQuestionErrors } from "@/components/quiz-form/useQuestionErrors";
import { Card } from "@/components/ui/Card";
import { FieldError } from "@/components/ui/FieldError";
import { Icon } from "@/components/ui/Icon";
import { TextInput } from "@/components/ui/TextInput";
import { questionTypeLabels, questionTypes, type QuestionTypeName } from "@/constants/quiz";
import type { CreateQuizFormValues } from "@/schemas/quiz-schema";

const answerFields: Record<QuestionTypeName, ComponentType<{ index: number }>> = {
  BOOLEAN: BooleanAnswerField,
  INPUT: TextAnswerField,
  CHECKBOX: CheckboxOptionsField,
};

type QuestionCardProps = {
  index: number;
  canRemove: boolean;
  onRemove: () => void;
};

function QuestionCardHeader({ index, canRemove, onRemove }: QuestionCardProps) {
  const { register } = useFormContext<CreateQuizFormValues>();

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] font-semibold text-ink">Question {index + 1}</span>
      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            aria-label="Question type"
            className="h-8.25 min-w-38 appearance-none rounded-lg border border-line bg-card pr-8 pl-3 text-[12px] leading-5 text-ink"
            {...register(`questions.${index}.type`)}
          >
            {questionTypes.map((type) => (
              <option key={type} value={type}>
                {questionTypeLabels[type]}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2">
            <Icon src="/icons/down.svg" />
          </span>
        </div>
        {canRemove ? (
          <button
            type="button"
            aria-label={`Remove question ${index + 1}`}
            className="rounded-lg p-1.5 hover:bg-paper"
            onClick={onRemove}
          >
            <Icon src="/icons/trash.svg" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function QuestionCard(props: QuestionCardProps) {
  const { index } = props;
  const { control, register } = useFormContext<CreateQuizFormValues>();
  const type = useWatch({ control, name: `questions.${index}.type` });
  const errors = useQuestionErrors(index);
  const AnswerField = answerFields[type];

  return (
    <Card as="fieldset">
      <legend className="sr-only">Question {index + 1}</legend>
      <QuestionCardHeader {...props} />

      <div className="mt-5 grid gap-4">
        <label className="grid gap-1.5">
          <TextInput placeholder="Write your question" {...register(`questions.${index}.prompt`)} />
          <FieldError message={errors?.prompt?.message} />
        </label>

        <AnswerField index={index} />
      </div>
    </Card>
  );
}
