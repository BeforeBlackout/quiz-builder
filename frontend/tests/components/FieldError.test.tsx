import { render, screen } from "@testing-library/react";

import { FieldError } from "@/components/FieldError";

describe("FieldError", () => {
  it("renders the message", () => {
    render(<FieldError message="Title is required" />);
    expect(screen.getByText("Title is required")).toBeInTheDocument();
  });

  it.each([undefined, ""])("renders nothing for %p", (message) => {
    const { container } = render(<FieldError message={message} />);
    expect(container).toBeEmptyDOMElement();
  });
});
