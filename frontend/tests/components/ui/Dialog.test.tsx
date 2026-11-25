import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Dialog } from "@/components/ui/Dialog";

function renderDialog(props: { canClose?: boolean } = {}) {
  const onClose = jest.fn();
  render(
    <Dialog title="Title" description="Description" onClose={onClose} {...props}>
      <input aria-label="Name" />
    </Dialog>,
  );
  return { onClose, user: userEvent.setup() };
}

describe("Dialog", () => {
  it("labels the dialog with its title and description", () => {
    renderDialog();

    const dialog = screen.getByRole("dialog", { name: "Title" });
    expect(dialog).toHaveAccessibleDescription("Description");
  });

  it("focuses the panel when no initial focus target is given", () => {
    renderDialog();
    expect(screen.getByRole("dialog")).toHaveFocus();
  });

  it("traps focus across any focusable element, not just buttons", async () => {
    const { user } = renderDialog();
    const close = screen.getByRole("button", { name: "Close dialog" });
    const input = screen.getByRole("textbox", { name: "Name" });

    input.focus();
    await user.tab();
    expect(input).toHaveFocus();
    expect(close).not.toHaveFocus();
  });

  it("ignores Escape and the backdrop while it cannot close", async () => {
    const { user, onClose } = renderDialog({ canClose: false });

    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Close dialog" })).toBeDisabled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
