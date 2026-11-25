import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";

import { createQuiz } from "@/api/quiz";
import { CreateQuizForm } from "@/components/quiz-form/CreateQuizForm";
import type { QuizDetail } from "@/types/quiz";
import { ApiError } from "@/utils/api";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/api/quiz", () => ({
  createQuiz: jest.fn(),
}));

const createQuizMock = jest.mocked(createQuiz);
const push = jest.fn();

function createdQuiz(id: number): QuizDetail {
  return { id, title: "", createdAt: "", updatedAt: "", questions: [] };
}

function setup() {
  const user = userEvent.setup();
  render(<CreateQuizForm />);
  return { user };
}

function questionCards() {
  return screen.getAllByRole("group", { name: /^Question \d+$/ });
}

function question(number: number) {
  return within(screen.getByRole("group", { name: `Question ${number}` }));
}

function overviewCount(label: "Boolean" | "Input" | "Checkbox" | "Questions") {
  const overview = within(screen.getByRole("complementary"));
  const labelElement = overview.getByText(label, { selector: "span, p" });
  const valueElement =
    label === "Questions" ? labelElement.previousElementSibling : labelElement.nextElementSibling;
  return valueElement?.textContent;
}

beforeEach(() => {
  push.mockReset();
  createQuizMock.mockReset();
  jest.mocked(useRouter).mockReturnValue({ push } as unknown as ReturnType<typeof useRouter>);
});

describe("CreateQuizForm", () => {
  it("starts with an empty title and one boolean question", () => {
    setup();

    expect(screen.getByRole("textbox", { name: "Quiz title" })).toHaveValue("");
    expect(questionCards()).toHaveLength(1);
    expect(question(1).getByRole("combobox", { name: "Question type" })).toHaveValue("BOOLEAN");
    expect(
      question(1).queryByRole("button", { name: "Remove question 1" }),
    ).not.toBeInTheDocument();
    expect(overviewCount("Questions")).toBe("01");
    expect(overviewCount("Boolean")).toBe("01");
    expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute("href", "/quizzes");
  });

  it("shows validation errors and does not submit an empty quiz", async () => {
    const { user } = setup();

    await user.click(screen.getByRole("button", { name: "Create quiz" }));

    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(question(1).getByText("Write the question")).toBeInTheDocument();
    expect(createQuizMock).not.toHaveBeenCalled();
  });

  it("adds and removes questions and keeps the overview in sync", async () => {
    const { user } = setup();

    await user.click(screen.getByRole("button", { name: "Add question" }));
    await user.click(screen.getByRole("button", { name: "Add question" }));

    expect(questionCards()).toHaveLength(3);
    expect(overviewCount("Questions")).toBe("03");
    expect(overviewCount("Boolean")).toBe("03");

    await user.type(question(2).getByPlaceholderText("Write your question"), "Second");
    await user.click(question(1).getByRole("button", { name: "Remove question 1" }));

    expect(questionCards()).toHaveLength(2);
    expect(overviewCount("Questions")).toBe("02");
    expect(question(1).getByPlaceholderText("Write your question")).toHaveValue("Second");
  });

  it("toggles the boolean answer", async () => {
    const { user } = setup();
    const trueButton = question(1).getByRole("button", { name: "True" });
    const falseButton = question(1).getByRole("button", { name: "False" });

    expect(trueButton).toHaveClass("text-accent");
    await user.click(falseButton);

    expect(falseButton).toHaveClass("text-accent");
    expect(trueButton).not.toHaveClass("text-accent");
  });

  it("switches to an input question and requires an expected answer", async () => {
    const { user } = setup();

    await user.selectOptions(question(1).getByRole("combobox", { name: "Question type" }), "INPUT");

    expect(question(1).getByPlaceholderText("Short text")).toBeInTheDocument();
    expect(question(1).queryByRole("button", { name: "True" })).not.toBeInTheDocument();
    expect(overviewCount("Input")).toBe("01");
    expect(overviewCount("Boolean")).toBe("00");

    await user.click(screen.getByRole("button", { name: "Create quiz" }));
    expect(await question(1).findByText("Add the expected answer")).toBeInTheDocument();
  });

  describe("checkbox questions", () => {
    async function setupCheckbox() {
      const result = setup();
      await result.user.selectOptions(
        question(1).getByRole("combobox", { name: "Question type" }),
        "CHECKBOX",
      );
      return result;
    }

    function correctToggles() {
      return question(1).getAllByRole("button", { name: /^Option \d+ is correct$/ });
    }

    it("starts with two options, the first marked correct", async () => {
      await setupCheckbox();

      expect(overviewCount("Checkbox")).toBe("01");
      expect(question(1).getByPlaceholderText("Option 1")).toBeInTheDocument();
      expect(question(1).getByPlaceholderText("Option 2")).toBeInTheDocument();
      expect(correctToggles().map((toggle) => toggle.getAttribute("aria-pressed"))).toEqual([
        "true",
        "false",
      ]);
    });

    it("toggles individual options and select/unselect all", async () => {
      const { user } = await setupCheckbox();

      await user.click(question(1).getByRole("button", { name: "Option 2 is correct" }));
      correctToggles().forEach((toggle) => expect(toggle).toHaveAttribute("aria-pressed", "true"));
      expect(question(1).getByRole("button", { name: "Unselect all" })).toBeInTheDocument();

      await user.click(question(1).getByRole("button", { name: "Unselect all" }));
      correctToggles().forEach((toggle) => expect(toggle).toHaveAttribute("aria-pressed", "false"));

      await user.click(question(1).getByRole("button", { name: "Select all" }));
      correctToggles().forEach((toggle) => expect(toggle).toHaveAttribute("aria-pressed", "true"));
    });

    it("adds options and only allows removing above the minimum of two", async () => {
      const { user } = await setupCheckbox();

      expect(question(1).getByRole("button", { name: "Remove option 1" })).toBeDisabled();

      await user.click(question(1).getByRole("button", { name: "Add option" }));
      expect(question(1).getByPlaceholderText("Option 3")).toBeInTheDocument();
      expect(question(1).getByRole("button", { name: "Remove option 1" })).toBeEnabled();

      await user.type(question(1).getByPlaceholderText("Option 3"), "Third");
      await user.click(question(1).getByRole("button", { name: "Remove option 1" }));

      expect(question(1).queryByPlaceholderText("Option 3")).not.toBeInTheDocument();
      expect(question(1).getByPlaceholderText("Option 2")).toHaveValue("Third");
    });

    it("requires at least two filled options", async () => {
      const { user } = await setupCheckbox();

      await user.type(question(1).getByPlaceholderText("Option 1"), "Only one");
      await user.click(screen.getByRole("button", { name: "Create quiz" }));

      expect(await question(1).findByText("Add at least 2 options")).toBeInTheDocument();
    });

    it("requires a correct option", async () => {
      const { user } = await setupCheckbox();

      await user.type(question(1).getByPlaceholderText("Option 1"), "A");
      await user.type(question(1).getByPlaceholderText("Option 2"), "B");
      await user.click(question(1).getByRole("button", { name: "Option 1 is correct" }));
      await user.click(screen.getByRole("button", { name: "Create quiz" }));

      expect(await question(1).findByText("Mark at least one correct option")).toBeInTheDocument();
    });
  });

  it("submits a trimmed payload and redirects to the new quiz", async () => {
    let finish!: (quiz: QuizDetail) => void;
    createQuizMock.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    const { user } = setup();

    await user.type(screen.getByRole("textbox", { name: "Quiz title" }), "  Geography ");
    await user.type(question(1).getByPlaceholderText("Write your question"), "Is water wet?");
    await user.click(question(1).getByRole("button", { name: "False" }));
    await user.click(screen.getByRole("button", { name: "Add question" }));
    await user.selectOptions(question(2).getByRole("combobox", { name: "Question type" }), "INPUT");
    await user.type(question(2).getByPlaceholderText("Write your question"), "Capital of Peru?");
    await user.type(question(2).getByPlaceholderText("Short text"), " Lima ");
    await user.click(screen.getByRole("button", { name: "Create quiz" }));

    const saving = await screen.findByRole("button", { name: "Saving…" });
    expect(saving).toBeDisabled();
    expect(saving).toHaveAttribute("aria-busy", "true");
    expect(createQuizMock).toHaveBeenCalledWith({
      title: "Geography",
      questions: [
        { type: "BOOLEAN", prompt: "Is water wet?", booleanAnswer: false },
        { type: "INPUT", prompt: "Capital of Peru?", textAnswer: "Lima" },
      ],
    });

    finish(createdQuiz(42));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/quizzes/42"));
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
  });

  it.each([
    [new ApiError("Title already taken", 409), "Title already taken"],
    [new Error("boom"), "Could not save the quiz"],
  ])("shows an error and re-enables submit when saving fails (%p)", async (error, message) => {
    createQuizMock.mockRejectedValue(error);
    const { user } = setup();

    await user.type(screen.getByRole("textbox", { name: "Quiz title" }), "Quiz");
    await user.type(question(1).getByPlaceholderText("Write your question"), "Question");
    await user.click(screen.getByRole("button", { name: "Create quiz" }));

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create quiz" })).toBeEnabled();
    expect(push).not.toHaveBeenCalled();
  });
});
