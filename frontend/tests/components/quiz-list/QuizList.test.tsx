import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";

import { deleteQuiz } from "@/api/quiz";
import { QuizList } from "@/components/quiz-list/QuizList";
import type { QuizSummary } from "@/types/quiz";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/api/quiz", () => ({
  deleteQuiz: jest.fn(),
}));

const deleteQuizMock = jest.mocked(deleteQuiz);
const refresh = jest.fn();

const quizzes: QuizSummary[] = [
  { id: 1, title: "Capitals", questionCount: 1 },
  { id: 2, title: "Chemistry", questionCount: 3 },
];

beforeEach(() => {
  refresh.mockReset();
  deleteQuizMock.mockReset();
  jest.mocked(useRouter).mockReturnValue({ refresh } as unknown as ReturnType<typeof useRouter>);
});

describe("QuizList", () => {
  it("shows an empty state with a single create link", () => {
    render(<QuizList quizzes={[]} />);

    expect(screen.getByText("No quizzes yet")).toBeInTheDocument();
    const links = screen.getAllByRole("link", { name: "Create quiz" });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/create");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("lists quizzes with links and pluralized question counts", () => {
    render(<QuizList quizzes={quizzes} />);

    expect(screen.getByRole("link", { name: "Create quiz" })).toHaveAttribute("href", "/create");
    const rows = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(rows).toHaveLength(2);

    expect(within(rows[0]).getByRole("link", { name: "Capitals" })).toHaveAttribute(
      "href",
      "/quizzes/1",
    );
    expect(within(rows[0]).getAllByText("1 question")).not.toHaveLength(0);
    expect(within(rows[1]).getByRole("link", { name: "Chemistry" })).toHaveAttribute(
      "href",
      "/quizzes/2",
    );
    expect(within(rows[1]).getAllByText("3 questions")).not.toHaveLength(0);
  });

  it("opens the delete dialog for the chosen quiz and closes it on cancel", async () => {
    const user = userEvent.setup();
    render(<QuizList quizzes={quizzes} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Delete Chemistry" }));

    expect(screen.getByRole("dialog")).toHaveAccessibleDescription(/“Chemistry”/);

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(deleteQuizMock).not.toHaveBeenCalled();
  });

  it("deletes the quiz, closes the dialog and refreshes the route", async () => {
    deleteQuizMock.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<QuizList quizzes={quizzes} />);

    await user.click(screen.getByRole("button", { name: "Delete Capitals" }));
    await user.click(screen.getByRole("button", { name: "Delete quiz" }));

    expect(deleteQuizMock).toHaveBeenCalledWith(1);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
