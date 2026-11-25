import Head from "next/head";

import { CreateQuizForm } from "@/components/CreateQuizForm";

export default function CreatePage() {
  return (
    <>
      <Head>
        <title>Create quiz · quiz-builder</title>
      </Head>
      <div className="mx-auto flex w-full max-w-[1132px] flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[31px] leading-[1.45] font-semibold tracking-tight">
              A little curiosity goes a long way.
            </h1>
            <p className="mt-2 text-sm text-muted">
              Build your quiz, choose the answers, and make knowledge stick.
            </p>
          </div>
          <span className="mt-2.5 hidden shrink-0 rounded-[5px] bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent sm:inline-flex">
            New quiz
          </span>
        </div>
        <CreateQuizForm />
      </div>
    </>
  );
}
