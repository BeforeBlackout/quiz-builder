import { render, screen, within } from "@testing-library/react";

import { QuestionView } from "@/components/quiz-detail/QuestionView";

describe("QuestionView", () => {
  it("shows the padded number, type label and prompt", () => {
    render(
      <QuestionView
        index={8}
        question={{
          id: 1,
          position: 8,
          type: "INPUT",
          prompt: "Capital of France?",
          textAnswer: "Paris",
        }}
      />,
    );

    expect(screen.getByText("Question 09")).toBeInTheDocument();
    expect(screen.getByText("Input")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Capital of France?" })).toBeInTheDocument();
  });

  it("renders the expected answer for input questions", () => {
    render(
      <QuestionView
        index={0}
        question={{ id: 1, position: 0, type: "INPUT", prompt: "Q", textAnswer: "Paris" }}
      />,
    );

    expect(screen.getByText("Expected answer")).toBeInTheDocument();
    expect(screen.getByText("Paris")).toBeInTheDocument();
  });

  it.each([
    [true, "True", "False"],
    [false, "False", "True"],
  ])(
    "marks %s as the correct answer for boolean questions",
    (booleanAnswer, correctLabel, otherLabel) => {
      render(
        <QuestionView
          index={0}
          question={{ id: 1, position: 0, type: "BOOLEAN", prompt: "Q", booleanAnswer }}
        />,
      );

      expect(screen.getByText("Boolean")).toBeInTheDocument();
      expect(screen.getByText(correctLabel)).toHaveTextContent(`${correctLabel}· Correct answer`);
      expect(screen.getByText(otherLabel)).not.toHaveTextContent("Correct answer");
    },
  );

  it("lists checkbox options and counts the correct ones", () => {
    render(
      <QuestionView
        index={0}
        question={{
          id: 1,
          position: 0,
          type: "CHECKBOX",
          prompt: "Pick primary colors",
          options: [
            { id: 1, position: 0, text: "Red", isCorrect: true },
            { id: 2, position: 1, text: "Green", isCorrect: false },
            { id: 3, position: 2, text: "Blue", isCorrect: true },
          ],
        }}
      />,
    );

    expect(screen.getByText("Checkbox")).toBeInTheDocument();
    expect(screen.getByText("2 correct answers")).toBeInTheDocument();
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual(["Red", "Green", "Blue"]);
  });

  it("uses the singular label when one option is correct", () => {
    render(
      <QuestionView
        index={0}
        question={{
          id: 1,
          position: 0,
          type: "CHECKBOX",
          prompt: "Q",
          options: [
            { id: 1, position: 0, text: "A", isCorrect: true },
            { id: 2, position: 1, text: "B", isCorrect: false },
          ],
        }}
      />,
    );

    expect(screen.getByText("1 correct answer")).toBeInTheDocument();
  });
});
