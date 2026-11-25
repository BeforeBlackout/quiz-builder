"use client";

import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { FieldLabel } from "@/components/quiz-form/FieldLabel";
import { useQuestionErrors } from "@/components/quiz-form/useQuestionErrors";
import { TextButton } from "@/components/ui/Button";
import { FieldError } from "@/components/ui/FieldError";
import { Icon } from "@/components/ui/Icon";
import { TextInput } from "@/components/ui/TextInput";
import { minCheckboxOptions } from "@/constants/quiz";
import type { CreateQuizFormValues } from "@/schemas/quiz-schema";
import { cx } from "@/utils/cx";

type OptionRowProps = {
  questionIndex: number;
  optionIndex: number;
  canRemove: boolean;
  onRemove: () => void;
};

function OptionRow({ questionIndex, optionIndex, canRemove, onRemove }: OptionRowProps) {
  const { control, register } = useFormContext<CreateQuizFormValues>();
  const errors = useQuestionErrors(questionIndex);
  const name = `questions.${questionIndex}.options.${optionIndex}` as const;

  return (
    <li className="grid gap-1">
      <div className="flex items-center gap-2.5">
        <Controller
          control={control}
          name={`${name}.isCorrect`}
          render={({ field }) => (
            <button
              type="button"
              aria-label={`Option ${optionIndex + 1} is correct`}
              aria-pressed={field.value}
              onClick={() => field.onChange(!field.value)}
              className={cx(
                "flex size-4.5 shrink-0 items-center justify-center rounded-sm",
                field.value ? "bg-accent" : "border border-border-checkbox bg-card",
              )}
            >
              {field.value ? <Icon src="/icons/check-white.svg" /> : null}
            </button>
          )}
        />
        <TextInput
          compact
          className="min-w-0 flex-1"
          placeholder={`Option ${optionIndex + 1}`}
          {...register(`${name}.text`)}
        />
        <button
          type="button"
          className="shrink-0 p-1 disabled:opacity-40"
          disabled={!canRemove}
          aria-label={`Remove option ${optionIndex + 1}`}
          onClick={onRemove}
        >
          <Icon src="/icons/trash-sm.svg" />
        </button>
      </div>
      <FieldError message={errors?.options?.[optionIndex]?.text?.message} />
    </li>
  );
}

export function CheckboxOptionsField({ index }: { index: number }) {
  const { control, setValue } = useFormContext<CreateQuizFormValues>();
  const errors = useQuestionErrors(index);
  const options = useFieldArray({ control, name: `questions.${index}.options` });
  const optionValues = useWatch({ control, name: `questions.${index}.options` }) ?? [];
  const allSelected = optionValues.length > 0 && optionValues.every((option) => option.isCorrect);

  function setAllCorrect(isCorrect: boolean) {
    optionValues.forEach((_, optionIndex) => {
      setValue(`questions.${index}.options.${optionIndex}.isCorrect`, isCorrect);
    });
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <FieldLabel>Answer options</FieldLabel>
        <TextButton className="text-[11px]" onClick={() => setAllCorrect(!allSelected)}>
          {allSelected ? "Unselect all" : "Select all"}
        </TextButton>
      </div>
      <ul className="grid gap-2">
        {options.fields.map((option, optionIndex) => (
          <OptionRow
            key={option.id}
            questionIndex={index}
            optionIndex={optionIndex}
            canRemove={options.fields.length > minCheckboxOptions}
            onRemove={() => options.remove(optionIndex)}
          />
        ))}
      </ul>
      <TextButton
        className="text-[12px]"
        onClick={() => options.append({ text: "", isCorrect: false })}
      >
        <Icon src="/icons/plus-sm.svg" />
        Add option
      </TextButton>
      <FieldError message={errors?.options?.root?.message ?? errors?.options?.message} />
    </div>
  );
}
