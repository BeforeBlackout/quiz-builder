"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-280">
      <h1 className="text-[31px] font-semibold">Something went wrong</h1>
      <p className="mt-2 text-muted">
        We couldn’t load this page. The API may be unreachable — make sure the backend is running.
      </p>
      <div className="mt-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex h-10.75 items-center rounded-[10px] bg-accent px-5 text-sm font-semibold text-card"
        >
          Try again
        </button>
        <Link href="/quizzes" className="text-sm font-semibold text-accent">
          Back to quizzes
        </Link>
      </div>
    </div>
  );
}
