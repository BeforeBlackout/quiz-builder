import { render, screen } from "@testing-library/react";

import { SummaryCard } from "@/components/ui/SummaryCard";

describe("SummaryCard", () => {
  it("renders the title, stats and rows", () => {
    render(
      <SummaryCard
        title="Overview"
        icon="/icons/book-overview.svg"
        stats={[{ label: "Questions", value: "03" }]}
        rows={[{ label: "Boolean", value: "2 questions" }]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByText("Questions").previousElementSibling).toHaveTextContent("03");
    expect(screen.getByText("Boolean").nextElementSibling).toHaveTextContent("2 questions");
  });

  it("omits the icon when none is given", () => {
    const { container } = render(<SummaryCard title="Overview" stats={[]} rows={[]} />);
    expect(container.querySelector("img")).toBeNull();
  });
});
