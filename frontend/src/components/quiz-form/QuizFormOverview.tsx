"use client";

import { useFormContext, useWatch } from "react-hook-form";

import { SummaryCard } from "@/components/ui/SummaryCard";
import { questionTypeLabels, questionTypes } from "@/constants/quiz";
import type { CreateQuizFormValues } from "@/schemas/quiz-schema";
import { pad2 } from "@/utils/format";
import { countByType } from "@/utils/quiz";

export function QuizFormOverview() {
  const { control } = useFormContext<CreateQuizFormValues>();
  const questions = useWatch({ control, name: "questions" }) ?? [];
  const counts = countByType(questions);

  return (
    <SummaryCard
      title="Your quiz at a glance"
      stats={[{ label: "Questions", value: pad2(questions.length) }]}
      rows={questionTypes.map((type) => ({
        label: questionTypeLabels[type],
        value: pad2(counts[type]),
      }))}
    />
  );
}
