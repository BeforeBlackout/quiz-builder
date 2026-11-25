"use client";

import {
  useActionState,
  useEffect,
  useId,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

import { ButtonLoader } from "@/components/ButtonLoader";
import { deleteQuiz } from "@/api/quiz";
import { ApiError } from "@/utils/api";

type DeleteQuizDialogProps = {
  quizId: number;
  title: string;
  onCancel: () => void;
  onDeleted: (id: number) => void;
};

export function DeleteQuizDialog({ quizId, title, onCancel, onDeleted }: DeleteQuizDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [error, confirmDelete, isDeleting] = useActionState(
    async (_previous: string | null, id: number) => {
      try {
        await deleteQuiz(id);
        onDeleted(id);
        return null;
      } catch (caught) {
        return caught instanceof ApiError ? caught.message : "Could not delete the quiz";
      }
    },
    null,
  );

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape" && !isDeleting) onCancel();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isDeleting, onCancel]);

  function trapFocus(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab" || !dialogRef.current) return;

    const items = [
      ...dialogRef.current.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"),
    ];
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-ink/40"
        disabled={isDeleting}
        onClick={onCancel}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative w-full max-w-105 rounded-xl border border-line bg-card p-6"
        onKeyDown={trapFocus}
      >
        <h2 id={titleId} className="text-lg font-semibold">
          Delete this quiz?
        </h2>
        <p id={descriptionId} className="mt-2 text-sm text-muted">
          “{title}” and its questions will be removed. This can’t be undone.
        </p>
        {error && !isDeleting ? <p className="mt-3 text-sm text-accent">{error}</p> : null}
        <form
          className="mt-6 flex items-center justify-end gap-3"
          action={() => confirmDelete(quizId)}
        >
          <button
            ref={cancelRef}
            type="button"
            className="inline-flex h-11.25 items-center rounded-[10px] border border-line bg-card px-5 text-sm font-medium text-ink disabled:opacity-60"
            disabled={isDeleting}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex h-11.25 items-center gap-2 rounded-[10px] bg-accent px-5 text-sm font-semibold text-card disabled:opacity-60"
            disabled={isDeleting}
            aria-busy={isDeleting}
          >
            {isDeleting ? <ButtonLoader /> : null}
            {isDeleting ? "Deleting…" : "Delete quiz"}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}
