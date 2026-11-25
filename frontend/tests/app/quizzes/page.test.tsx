import { render, screen } from "@testing-library/react";

import QuizzesPage from "@/app/quizzes/page";
import { listQuizzes } from "@/api/quiz";
import { ApiError } from "@/utils/api";

jest.mock("next/server", () => ({
  connection: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

jest.mock("@/api/quiz", () => ({
  listQuizzes: jest.fn(),
}));

const listQuizzesMock = jest.mocked(listQuizzes);

describe("QuizzesPage", () => {
  it("renders the quiz list", async () => {
    listQuizzesMock.mockResolvedValue([{ id: 1, title: "Capitals", questionCount: 2 }]);

    render(await QuizzesPage());

    expect(screen.getByRole("heading", { name: "My quizzes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Capitals" })).toHaveAttribute("href", "/quizzes/1");
  });

  it.each([
    [
      new ApiError("The API is unreachable. Start the backend and try again.", 0),
      "The API is unreachable. Start the backend and try again.",
    ],
    [new Error("boom"), "Could not load quizzes"],
  ])("shows an error when loading fails (%p)", async (error, message) => {
    listQuizzesMock.mockRejectedValue(error);

    render(await QuizzesPage());

    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "My quizzes" })).not.toBeInTheDocument();
  });
});
