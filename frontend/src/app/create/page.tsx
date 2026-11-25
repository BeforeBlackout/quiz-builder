import type { Metadata } from "next";

import { CreateQuizForm } from "@/components/quiz-form/CreateQuizForm";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "New quiz",
  description:
    "Create a new quiz: add questions, choose answer types and mark the correct answers.",
};

export default function CreatePage() {
  return (
    <div className="mx-auto flex w-full max-w-280 flex-col gap-6">
      <PageHeader
        title="A little curiosity goes a long way."
        description="Build your quiz, choose the answers, and make knowledge stick."
        action={
          <Badge tone="accent" className="mt-2.5 hidden shrink-0 sm:inline-flex">
            New quiz
          </Badge>
        }
      />
      <CreateQuizForm />
    </div>
  );
}
