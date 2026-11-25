"use client";

import { Controller, useFormContext } from "react-hook-form";

import { FieldLabel } from "@/components/quiz-form/FieldLabel";
import { Icon } from "@/components/ui/Icon";
import { booleanChoices } from "@/constants/quiz";
import type { CreateQuizFormValues } from "@/schemas/quiz-schema";
import { cx } from "@/utils/cx";

export function BooleanAnswerField({ index }: { index: number }) {
  const { control } = useFormContext<CreateQuizFormValues>();

  return (
    <Controller
      control={control}
      name={`questions.${index}.booleanAnswer`}
      render={({ field }) => (
        <div className="grid gap-2">
          <FieldLabel>Correct answer</FieldLabel>
          <div className="flex flex-wrap gap-3">
            {booleanChoices.map((choice) => {
              const selected = field.value === choice.value;
              return (
                <button
                  key={choice.label}
                  type="button"
                  onClick={() => field.onChange(choice.value)}
                  className={cx(
                    "inline-flex h-9.75 items-center gap-2 rounded-md px-3.5 text-[13px] font-medium",
                    selected ? "bg-accent-soft text-accent" : "bg-paper text-muted",
                  )}
                >
                  <Icon src={selected ? "/icons/radio-on.svg" : "/icons/radio-off.svg"} />
                  {choice.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    />
  );
}
