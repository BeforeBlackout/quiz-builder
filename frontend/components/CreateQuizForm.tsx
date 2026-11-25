import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { FieldError } from "@/components/FieldError";
import { Icon } from "@/components/Icon";
import { QuestionCard } from "@/components/QuestionCard";
import { ApiError, createQuiz } from "@/services/api";
import {
  blankQuestion,
  createQuizFormSchema,
  toCreateQuizPayload,
  type CreateQuizForm,
  type QuestionTypeName,
} from "@/services/quiz-schema";

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function CreateQuizForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateQuizForm>({
    resolver: zodResolver(createQuizFormSchema),
    defaultValues: {
      title: "",
      questions: [blankQuestion()],
    },
  });
  const questions = useFieldArray({ control, name: "questions" });
  const watchedQuestions = useWatch({ control, name: "questions" });

  const overview = useMemo(() => {
    const rows = watchedQuestions ?? [];
    const counts: Record<QuestionTypeName, number> = {
      BOOLEAN: 0,
      INPUT: 0,
      CHECKBOX: 0,
    };
    for (const question of rows) {
      if (question?.type) counts[question.type] += 1;
    }
    const typesUsed = (Object.values(counts) as number[]).filter((count) => count > 0).length;
    return { counts, typesUsed, total: rows.length };
  }, [watchedQuestions]);

  async function onSubmit(value: CreateQuizForm) {
    setSubmitError(null);
    try {
      const quiz = await createQuiz(toCreateQuizPayload(value));
      await router.push(`/quizzes/${quiz.id}`);
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : "Could not save the quiz");
    }
  }

  return (
    <form
      className="grid gap-6 lg:grid-cols-[minmax(0,780px)_328px] lg:items-start"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="grid gap-4">
        <section className="rounded-[12px] border border-line bg-card p-6">
          <label className="grid gap-2">
            <span className="text-[13px] font-medium text-ink">Quiz title</span>
            <input
              className="h-11 rounded-[8px] border border-border-input bg-card px-3.5 text-sm text-ink placeholder:text-muted"
              placeholder="Give your quiz"
              {...register("title")}
            />
            <FieldError message={errors.title?.message} />
          </label>
        </section>

        <div className="flex items-end justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-semibold">Questions</h2>
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-[5px] bg-accent-soft px-2 text-[11px] font-medium text-accent">
              {overview.total}
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
            control={control}
            register={register}
            errors={errors}
            canRemove={questions.fields.length > 1}
            onRemove={() => questions.remove(index)}
          />
        ))}
        <FieldError message={errors.questions?.message} />

        <button
          type="button"
          className="flex h-[49px] items-center justify-center gap-2 rounded-[10px] border border-dashed border-line bg-card text-sm font-medium text-ink hover:bg-paper"
          onClick={() => questions.append(blankQuestion())}
        >
          <Icon src="/icons/plus-active.svg" />
          Add question
        </button>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/quizzes"
            className="inline-flex h-[45px] items-center rounded-[10px] border border-line bg-card px-5 text-sm font-medium text-ink"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-[43px] items-center gap-2 rounded-[10px] bg-accent px-5 text-sm font-semibold text-card disabled:opacity-60"
          >
            <Icon src="/icons/arrow.svg" />
            {isSubmitting ? "Saving…" : "Create quiz"}
          </button>
        </div>
        {submitError ? <p className="text-sm text-accent">{submitError}</p> : null}
      </div>

      <aside className="grid gap-5">
        <section className="rounded-[12px] border border-line bg-card p-6">
          <h2 className="text-base font-semibold">Your quiz at a glance</h2>
          <div className="mt-5 flex gap-3">
            <div className="w-[128px]">
              <p className="text-[31px] font-semibold leading-none">{pad2(overview.total)}</p>
              <p className="mt-1 text-[11px] text-muted">Questions</p>
            </div>
            <div className="w-[128px]">
              <p className="text-[31px] font-semibold leading-none">{pad2(overview.typesUsed)}</p>
              <p className="mt-1 text-[11px] text-muted">Question types</p>
            </div>
          </div>
          <div className="my-5 h-px bg-line" />
          {(
            [
              ["BOOLEAN", "Boolean"],
              ["INPUT", "Input"],
              ["CHECKBOX", "Checkbox"],
            ] as const
          ).map(([key, label]) => (
            <div
              key={key}
              className="flex items-center justify-between py-2 text-[13px] first:pt-0 last:pb-0"
            >
              <span className="text-muted">{label}</span>
              <span className="font-medium">{pad2(overview.counts[key])}</span>
            </div>
          ))}
        </section>

        <section className="rounded-[12px] border border-line bg-card p-6">
          <h2 className="text-[15px] font-semibold">A format for every idea</h2>
          <ul className="mt-5 grid gap-5">
            {[
              ["01", "Boolean", "A simple true or false."],
              ["02", "Input", "A short answer, in their own words."],
              ["03", "Checkbox", "More than one right answer."],
            ].map(([num, title, body]) => (
              <li key={num} className="flex gap-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-[6px] bg-paper text-[10px] font-semibold text-muted">
                  {num}
                </span>
                <div>
                  <p className="text-[12px] font-medium">{title}</p>
                  <p className="text-[11px] text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[10px] bg-accent-wash p-[22px]">
          <div className="flex items-center gap-2.5">
            <Icon src="/icons/info.svg" />
            <p className="text-[12px] font-semibold text-accent">Keep it clear, keep it curious.</p>
          </div>
          <p className="mt-3 text-[12px] leading-[1.45] text-muted">
            One idea per question makes a great quiz. Keep your wording simple and your answer
            choices distinct.
          </p>
        </section>
      </aside>
    </form>
  );
}
