import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { deleteQuiz } from "@/api/quiz";
import { DeleteQuizDialog } from "@/components/quiz-list/DeleteQuizDialog";
import { ApiError } from "@/utils/api";

jest.mock("@/api/quiz", () => ({
  deleteQuiz: jest.fn(),
}));

const deleteQuizMock = jest.mocked(deleteQuiz);

function renderDialog() {
  const onCancel = jest.fn();
  const onDeleted = jest.fn();
  const view = render(
    <DeleteQuizDialog quizId={4} title="Capitals" onCancel={onCancel} onDeleted={onDeleted} />,
  );
  return { ...view, onCancel, onDeleted, user: userEvent.setup() };
}

beforeEach(() => {
  deleteQuizMock.mockReset();
});

describe("DeleteQuizDialog", () => {
  it("renders an accessible modal describing the quiz", () => {
    renderDialog();

    const dialog = screen.getByRole("dialog", { name: "Delete this quiz?" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleDescription(
      "“Capitals” and its questions will be removed. This can’t be undone.",
    );
  });

  it("focuses Cancel when opened", () => {
    renderDialog();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  });

  it("locks body scroll while open and restores it on unmount", () => {
    document.body.style.overflow = "auto";
    const { unmount } = renderDialog();

    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("auto");
  });

  it.each([
    [
      "the Cancel button",
      (user: ReturnType<typeof userEvent.setup>) =>
        user.click(screen.getByRole("button", { name: "Cancel" })),
    ],
    [
      "the backdrop",
      (user: ReturnType<typeof userEvent.setup>) =>
        user.click(screen.getByRole("button", { name: "Close dialog" })),
    ],
    ["the Escape key", (user: ReturnType<typeof userEvent.setup>) => user.keyboard("{Escape}")],
  ])("cancels via %s", async (_name, action) => {
    const { user, onCancel } = renderDialog();

    await action(user);

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(deleteQuizMock).not.toHaveBeenCalled();
  });

  it("keeps focus inside the dialog when tabbing", async () => {
    const { user } = renderDialog();
    const cancel = screen.getByRole("button", { name: "Cancel" });
    const confirm = screen.getByRole("button", { name: "Delete quiz" });

    await user.tab();
    expect(confirm).toHaveFocus();
    await user.tab();
    expect(cancel).toHaveFocus();
    await user.tab({ shift: true });
    expect(confirm).toHaveFocus();
  });

  it("deletes the quiz and reports success", async () => {
    deleteQuizMock.mockResolvedValue(undefined);
    const { user, onDeleted } = renderDialog();

    await user.click(screen.getByRole("button", { name: "Delete quiz" }));

    expect(deleteQuizMock).toHaveBeenCalledWith(4);
    expect(onDeleted).toHaveBeenCalledTimes(1);
  });

  it("disables every way out while the delete is in flight", async () => {
    let finish!: () => void;
    deleteQuizMock.mockReturnValue(new Promise<void>((resolve) => (finish = resolve)));
    const { user, onCancel, onDeleted } = renderDialog();

    await user.click(screen.getByRole("button", { name: "Delete quiz" }));

    const pending = await screen.findByRole("button", { name: "Deleting…" });
    expect(pending).toBeDisabled();
    expect(pending).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Close dialog" })).toBeDisabled();
    await user.keyboard("{Escape}");
    expect(onCancel).not.toHaveBeenCalled();

    finish();
    await screen.findByRole("button", { name: "Delete quiz" });
    expect(onDeleted).toHaveBeenCalledTimes(1);
  });

  it("shows the API error message when deletion fails", async () => {
    deleteQuizMock.mockRejectedValue(new ApiError("Quiz is locked", 409));
    const { user, onDeleted } = renderDialog();

    await user.click(screen.getByRole("button", { name: "Delete quiz" }));

    expect(await screen.findByText("Quiz is locked")).toBeInTheDocument();
    expect(onDeleted).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Delete quiz" })).toBeEnabled();
  });

  it("shows a generic message for unexpected errors", async () => {
    deleteQuizMock.mockRejectedValue(new Error("boom"));
    const { user } = renderDialog();

    await user.click(screen.getByRole("button", { name: "Delete quiz" }));

    expect(await screen.findByText("Could not delete the quiz")).toBeInTheDocument();
  });
});
