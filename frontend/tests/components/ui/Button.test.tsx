import { render, screen } from "@testing-library/react";

import { Button, LinkButton, TextButton } from "@/components/ui/Button";

describe("Button", () => {
  it("defaults to a primary non-submit button", () => {
    render(<Button>Save</Button>);

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("bg-accent");
  });

  it("supports the secondary variant, submit type and extra classes", () => {
    render(
      <Button type="submit" variant="secondary" className="w-full">
        Go
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Go" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveClass("border-line", "w-full");
    expect(button).not.toHaveClass("bg-accent");
  });
});

describe("LinkButton", () => {
  it("renders a styled link", () => {
    render(
      <LinkButton href="/create" variant="secondary">
        New
      </LinkButton>,
    );

    const link = screen.getByRole("link", { name: "New" });
    expect(link).toHaveAttribute("href", "/create");
    expect(link).toHaveClass("border-line");
  });
});

describe("TextButton", () => {
  it("renders an accent text button", () => {
    render(<TextButton className="text-[11px]">Select all</TextButton>);

    const button = screen.getByRole("button", { name: "Select all" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("text-accent", "text-[11px]");
  });
});
