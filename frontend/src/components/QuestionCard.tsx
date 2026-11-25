"use client";

import {
  Controller,
  useFieldArray,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";

import { FieldError } from "@/components/FieldError";
import { Icon } from "@/components/Icon";
import {
  minCheckboxOptions,
  questionTypes,
  type CreateQuizForm,
  type QuestionTypeName,
} from "@/schemas/quiz-schema";

const typeLabels: Record<QuestionTypeName, string> = {
  BOOLEAN: "Boolean",
  INPUT: "Input",
  CHECKBOX: "Checkbox",
};

const textActionClass =
  "rounded-[5px] px-1.5 py-0.5 font-medium text-accent transition-colors hover:bg-accent-soft";

type QuestionCardProps = {
  index: number;
  control: Control<CreateQuizForm>;
  register: UseFormRegister<CreateQuizForm>;
  errors: FieldErrors<CreateQuizForm>;
  onRemove: () => void;
  canRemove: boolean;
};

export function QuestionCard({
  index,
  control,
  register,
  errors,
  onRemove,
  canRemove,
}: QuestionCardProps) {
  const questionErrors = errors.questions?.[index];
  const options = useFieldArray({ control, name: `questions.${index}.options` });
  const type = useWatch({ control, name: `questions.${index}.type` });
  const optionValues = useWatch({ control, name: `questions.${index}.options` });

  const answerOptions = optionValues ?? [];
  const allSelected = answerOptions.length > 0 && answerOptions.every((option) => option.isCorrect);

  function setAllCorrect(isCorrect: boolean) {
    options.replace(
      answerOptions.map((option) => ({
        text: option.text,
        isCorrect,
      })),
    );
  }

  return (
    <fieldset className="rounded-xl border border-line bg-card p-6">
      <legend className="sr-only">Question {index + 1}</legend>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold text-ink">Question {index + 1}</span>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              aria-label="Question type"
              className="h-8.25 min-w-38 appearance-none rounded-lg border border-line bg-card pr-8 pl-3 text-[12px] leading-5 text-ink"
              {...register(`questions.${index}.type`)}
            >
              {questionTypes.map((value) => (
                <option key={value} value={value}>
                  {typeLabels[value]}
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

      <div className="mt-5 grid gap-4">
        <label className="grid gap-1.5">
          <input
            className="h-11 rounded-lg border border-border-input bg-card px-3.5 text-sm text-ink placeholder:text-muted"
            placeholder="Write your question"
            {...register(`questions.${index}.prompt`)}
          />
          <FieldError message={questionErrors?.prompt?.message} />
        </label>

        {type === "BOOLEAN" ? (
          <Controller
            control={control}
            name={`questions.${index}.booleanAnswer`}
            render={({ field }) => (
              <div className="grid gap-2">
                <span className="text-[11px] font-medium text-muted">Correct answer</span>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: "True", value: true },
                    { label: "False", value: false },
                  ].map((answer) => {
                    const selected = field.value === answer.value;
                    return (
                      <button
                        key={answer.label}
                        type="button"
                        onClick={() => field.onChange(answer.value)}
                        className={`inline-flex h-9.75 items-center gap-2 rounded-md px-3.5 text-[13px] font-medium ${
                          selected ? "bg-accent-soft text-accent" : "bg-paper text-muted"
                        }`}
                      >
                        <Icon src={selected ? "/icons/radio-on.svg" : "/icons/radio-off.svg"} />
                        {answer.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          />
        ) : null}

        {type === "INPUT" ? (
          <label className="grid gap-2">
            <span className="text-[11px] font-medium text-muted">Correct answer</span>
            <input
              className="h-11 rounded-lg border border-border-input bg-card px-3.5 text-sm text-ink placeholder:text-muted"
              placeholder="Short text"
              {...register(`questions.${index}.textAnswer`)}
            />
            <FieldError message={questionErrors?.textAnswer?.message} />
          </label>
        ) : null}

        {type === "CHECKBOX" ? (
          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-medium text-muted">Answer options</span>
              <button
                type="button"
                className={`${textActionClass} text-[11px]`}
                onClick={() => setAllCorrect(!allSelected)}
              >
                {allSelected ? "Unselect all" : "Select all"}
              </button>
            </div>
            <ul className="grid gap-2">
              {options.fields.map((option, optionIndex) => (
                <li key={option.id} className="grid gap-1">
                  <div className="flex items-center gap-2.5">
                    <Controller
                      control={control}
                      name={`questions.${index}.options.${optionIndex}.isCorrect`}
                      render={({ field }) => (
                        <button
                          type="button"
                          aria-label={`Option ${optionIndex + 1} is correct`}
                          aria-pressed={field.value}
                          onClick={() => field.onChange(!field.value)}
                          className={`flex size-4.5 shrink-0 items-center justify-center rounded-sm ${
                            field.value ? "bg-accent" : "border border-[#bbc3ce] bg-card"
                          }`}
                        >
                          {field.value ? <Icon src="/icons/check-white.svg" /> : null}
                        </button>
                      )}
                    />
                    <input
                      className="min-w-0 flex-1 rounded-lg border border-border-input bg-card px-3.5 py-1.5 text-sm"
                      placeholder={`Option ${optionIndex + 1}`}
                      {...register(`questions.${index}.options.${optionIndex}.text`)}
                    />
                    <button
                      type="button"
                      className="shrink-0 p-1 disabled:opacity-40"
                      disabled={options.fields.length <= minCheckboxOptions}
                      aria-label={`Remove option ${optionIndex + 1}`}
                      onClick={() => options.remove(optionIndex)}
                    >
                      <Icon src="/icons/trash-sm.svg" />
                    </button>
                  </div>
                  <FieldError message={questionErrors?.options?.[optionIndex]?.text?.message} />
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={`${textActionClass} inline-flex w-fit items-center gap-2 text-[12px]`}
              onClick={() => options.append({ text: "", isCorrect: false })}
            >
              <Icon src="/icons/plus-sm.svg" />
              Add option
            </button>
            <FieldError
              message={questionErrors?.options?.root?.message ?? questionErrors?.options?.message}
            />
          </div>
        ) : null}
      </div>
    </fieldset>
  );
}
