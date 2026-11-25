"use client";

import { useRouter } from "next/navigation";
import { startTransition, useActionState } from "react";

import { createQuiz } from "@/api/quiz";
import type { CreateQuizFormValues } from "@/schemas/quiz-schema";
import { getErrorMessage } from "@/utils/api";
import { toCreateQuizPayload } from "@/utils/quiz";

type CreateQuizState =
  { status: "idle" } | { status: "created" } | { status: "error"; message: string };

export function useCreateQuiz() {
  const router = useRouter();
  const [state, dispatch, isPending] = useActionState(
    async (_previous: CreateQuizState, value: CreateQuizFormValues): Promise<CreateQuizState> => {
      try {
        const quiz = await createQuiz(toCreateQuizPayload(value));
        router.push(`/quizzes/${quiz.id}`);
        return { status: "created" };
      } catch (error) {
        return { status: "error", message: getErrorMessage(error, "Could not save the quiz") };
      }
    },
    { status: "idle" },
  );

  function submit(value: CreateQuizFormValues) {
    startTransition(() => dispatch(value));
  }

  return {
    submit,
    // Stay busy after success so the button can't resubmit while navigating away.
    isSaving: isPending || state.status === "created",
    error: !isPending && state.status === "error" ? state.message : null,
  };
}
