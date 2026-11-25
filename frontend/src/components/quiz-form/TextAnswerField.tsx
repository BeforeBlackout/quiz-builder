"use client";

import { useFormContext } from "react-hook-form";

import { FieldLabel } from "@/components/quiz-form/FieldLabel";
import { useQuestionErrors } from "@/components/quiz-form/useQuestionErrors";
import { FieldError } from "@/components/ui/FieldError";
import { TextInput } from "@/components/ui/TextInput";
import type { CreateQuizFormValues } from "@/schemas/quiz-schema";

export function TextAnswerField({ index }: { index: number }) {
  const { register } = useFormContext<CreateQuizFormValues>();
  const errors = useQuestionErrors(index);

  return (
    <label className="grid gap-2">
      <FieldLabel>Correct answer</FieldLabel>
      <TextInput placeholder="Short text" {...register(`questions.${index}.textAnswer`)} />
      <FieldError message={errors?.textAnswer?.message} />
    </label>
  );
}
