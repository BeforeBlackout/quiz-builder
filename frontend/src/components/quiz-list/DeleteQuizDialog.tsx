"use client";

import { useActionState, useRef } from "react";

import { deleteQuiz } from "@/api/quiz";
import { Button } from "@/components/ui/Button";
import { ButtonLoader } from "@/components/ui/ButtonLoader";
import { Dialog } from "@/components/ui/Dialog";
import { getErrorMessage } from "@/utils/api";

type DeleteQuizDialogProps = {
  quizId: number;
  title: string;
  onCancel: () => void;
  onDeleted: () => void;
};

export function DeleteQuizDialog({ quizId, title, onCancel, onDeleted }: DeleteQuizDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [error, confirmDelete, isDeleting] = useActionState(async () => {
    try {
      await deleteQuiz(quizId);
      onDeleted();
      return null;
    } catch (caught) {
      return getErrorMessage(caught, "Could not delete the quiz");
    }
  }, null);

  return (
    <Dialog
      title="Delete this quiz?"
      description={<>“{title}” and its questions will be removed. This can’t be undone.</>}
      onClose={onCancel}
      canClose={!isDeleting}
      initialFocusRef={cancelRef}
    >
      {error && !isDeleting ? <p className="mt-3 text-sm text-accent">{error}</p> : null}
      <form className="mt-6 flex items-center justify-end gap-3" action={confirmDelete}>
        <Button ref={cancelRef} variant="secondary" disabled={isDeleting} onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isDeleting} aria-busy={isDeleting}>
          {isDeleting ? <ButtonLoader /> : null}
          {isDeleting ? "Deleting…" : "Delete quiz"}
        </Button>
      </form>
    </Dialog>
  );
}
