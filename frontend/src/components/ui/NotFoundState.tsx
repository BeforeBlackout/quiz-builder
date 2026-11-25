import Link from "next/link";

export function NotFoundState({ title, message }: { title: string; message: string }) {
  return (
    <div className="mx-auto w-full max-w-283">
      <h1 className="text-[31px] font-semibold">{title}</h1>
      <p className="mt-2 text-muted">{message}</p>
      <Link href="/quizzes" className="mt-4 inline-block text-sm font-semibold text-accent">
        Back to quizzes
      </Link>
    </div>
  );
}
