"use client";

import { useFormState } from "react-hook-form";

import type { CreateQuizFormValues } from "@/schemas/quiz-schema";

export function useQuestionErrors(index: number) {
  const { errors } = useFormState<CreateQuizFormValues>({ name: `questions.${index}` });
  return errors.questions?.[index];
}
