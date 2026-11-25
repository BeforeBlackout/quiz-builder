"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";

import { QuestionCard } from "@/components/quiz-form/QuestionCard";
import { QuizFormOverview } from "@/components/quiz-form/QuizFormOverview";
import { useCreateQuiz } from "@/components/quiz-form/useCreateQuiz";
import { Button, LinkButton } from "@/components/ui/Button";
import { ButtonLoader } from "@/components/ui/ButtonLoader";
import { Callout } from "@/components/ui/Callout";
import { Card } from "@/components/ui/Card";
import { FieldError } from "@/components/ui/FieldError";
import { Icon } from "@/components/ui/Icon";
import { TextInput } from "@/components/ui/TextInput";
import { createQuizFormSchema, type CreateQuizFormValues } from "@/schemas/quiz-schema";
import { blankQuestion } from "@/utils/quiz";

export function CreateQuizForm() {
  const { submit, isSaving, error } = useCreateQuiz();
  const form = useForm<CreateQuizFormValues>({
    resolver: zodResolver(createQuizFormSchema),
    defaultValues: {
      title: "",
      questions: [blankQuestion()],
    },
  });
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = form;
  const questions = useFieldArray({ control, name: "questions" });

  return (
    <FormProvider {...form}>
      <form
        className="grid gap-6 lg:grid-cols-[minmax(0,780px)_328px] lg:items-start"
        onSubmit={handleSubmit(submit)}
        noValidate
      >
        <div className="grid gap-4">
          <Card>
            <label className="grid gap-2">
              <span className="text-[13px] font-medium text-ink">Quiz title</span>
              <TextInput
                placeholder="Give your quiz a clear, memorable name"
                {...register("title")}
              />
              <FieldError message={errors.title?.message} />
            </label>
          </Card>

          <div className="flex items-end justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-semibold">Questions</h2>
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-[5px] bg-accent-soft px-2 text-[11px] font-medium text-accent">
                {questions.fields.length}
              </span>
            </div>
            <p className="hidden text-[11px] text-muted sm:block">
              Set the correct answer for each question.
            </p>
          </div>

          {questions.fields.map((question, index) => (
            <QuestionCard
              key={question.id}
              index={index}
              canRemove={questions.fields.length > 1}
              onRemove={() => questions.remove(index)}
            />
          ))}
          <FieldError message={errors.questions?.root?.message ?? errors.questions?.message} />

          <button
            type="button"
            className="flex h-12.25 items-center justify-center gap-2 rounded-[10px] border border-dashed border-line bg-card text-sm font-medium text-ink hover:bg-paper"
            onClick={() => questions.append(blankQuestion())}
          >
            <Icon src="/icons/plus-active.svg" />
            Add question
          </button>

          <div className="flex items-center justify-end gap-3 pt-2">
            <LinkButton href="/quizzes" variant="secondary">
              Cancel
            </LinkButton>
            <Button type="submit" disabled={isSaving} aria-busy={isSaving}>
              {isSaving ? <ButtonLoader /> : <Icon src="/icons/arrow.svg" />}
              {isSaving ? "Saving…" : "Create quiz"}
            </Button>
          </div>
          {error ? <p className="text-sm text-accent">{error}</p> : null}
        </div>

        <aside className="grid gap-5">
          <QuizFormOverview />
          <Callout tone="accent" icon="/icons/info.svg" title="Keep it clear, keep it curious.">
            One idea per question makes a great quiz. Keep your wording simple and your answer
            options distinct.
          </Callout>
        </aside>
      </form>
    </FormProvider>
  );
}
