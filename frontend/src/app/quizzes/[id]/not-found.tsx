import type { Metadata } from "next";

import { NotFoundState } from "@/components/ui/NotFoundState";

export const metadata: Metadata = {
  title: "Quiz not found",
  description: "This quiz doesn't exist or has been deleted.",
};

export default function QuizNotFound() {
  return <NotFoundState title="Quiz not found" message="That quiz is not in the database." />;
}
