import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { HoverPrefetchLink } from "@/components/HoverPrefetchLink";

describe("HoverPrefetchLink", () => {
  it("renders a link with the given props", () => {
    render(
      <HoverPrefetchLink href="/quizzes/5" className="title">
        Capitals
      </HoverPrefetchLink>,
    );

    const link = screen.getByRole("link", { name: "Capitals" });
    expect(link).toHaveAttribute("href", "/quizzes/5");
    expect(link).toHaveClass("title");
  });

  it("forwards mouse enter events to the caller", async () => {
    const user = userEvent.setup();
    const onMouseEnter = jest.fn();
    render(
      <HoverPrefetchLink href="/quizzes/5" onMouseEnter={onMouseEnter}>
        Capitals
      </HoverPrefetchLink>,
    );

    await user.hover(screen.getByRole("link", { name: "Capitals" }));

    expect(onMouseEnter).toHaveBeenCalledTimes(1);
  });
});
