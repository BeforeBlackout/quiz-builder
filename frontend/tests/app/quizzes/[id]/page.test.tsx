import { render, screen, within } from "@testing-library/react";
import { notFound } from "next/navigation";

import QuizDetailPage, { generateMetadata } from "@/app/quizzes/[id]/page";
import { getQuiz } from "@/api/quiz";
import type { QuizDetail } from "@/types/quiz";
import { ApiError } from "@/utils/api";

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

jest.mock("@/api/quiz", () => ({
  getQuiz: jest.fn(),
}));

const getQuizMock = jest.mocked(getQuiz);

const quiz: QuizDetail = {
  id: 3,
  title: "General knowledge",
  createdAt: "2026-01-05T12:00:00.000Z",
  updatedAt: "2026-01-05T12:00:00.000Z",
  questions: [
    { id: 10, position: 0, type: "BOOLEAN", prompt: "The sky is blue", booleanAnswer: true },
    { id: 11, position: 1, type: "BOOLEAN", prompt: "Fire is cold", booleanAnswer: false },
    { id: 12, position: 2, type: "INPUT", prompt: "Capital of Peru?", textAnswer: "Lima" },
  ],
};

function props(id: string): PageProps<"/quizzes/[id]"> {
  return { params: Promise.resolve({ id }), searchParams: Promise.resolve({}) };
}

beforeEach(() => {
  getQuizMock.mockReset();
  jest.mocked(notFound).mockClear();
});

describe("QuizDetailPage", () => {
  it("renders the quiz header, questions and overview", async () => {
    getQuizMock.mockResolvedValue(quiz);

    render(await QuizDetailPage(props("3")));

    expect(getQuizMock).toHaveBeenCalledWith(3);
    expect(
      screen.getByRole("heading", { level: 1, name: "General knowledge" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Created Jan 5, 2026/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to my quizzes" })).toHaveAttribute(
      "href",
      "/quizzes",
    );

    const questions = within(screen.getByRole("list")).getAllByRole("heading", { level: 2 });
    expect(questions.map((heading) => heading.textContent)).toEqual([
      "The sky is blue",
      "Fire is cold",
      "Capital of Peru?",
    ]);

    const overview = within(screen.getByRole("complementary"));
    expect(overview.getByText("Questions").previousElementSibling).toHaveTextContent("03");
    expect(overview.getByText("Question types").previousElementSibling).toHaveTextContent("02");
    expect(overview.getByText("Boolean").nextElementSibling).toHaveTextContent("2 questions");
    expect(overview.getByText("Input").nextElementSibling).toHaveTextContent("1 question");
    expect(overview.getByText("Checkbox").nextElementSibling).toHaveTextContent("0 questions");
  });

  it.each(["abc", "1.5"])("calls notFound for the non-integer id %p", async (id) => {
    await expect(QuizDetailPage(props(id))).rejects.toThrow("NEXT_NOT_FOUND");
    expect(getQuizMock).not.toHaveBeenCalled();
  });

  it("calls notFound when the API returns 404", async () => {
    getQuizMock.mockRejectedValue(new ApiError("Quiz not found", 404));

    await expect(QuizDetailPage(props("3"))).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });

  it("rethrows other API errors", async () => {
    const error = new ApiError("Server exploded", 500);
    getQuizMock.mockRejectedValue(error);

    await expect(QuizDetailPage(props("3"))).rejects.toBe(error);
    expect(notFound).not.toHaveBeenCalled();
  });
});

describe("generateMetadata", () => {
  it("uses the quiz title", async () => {
    getQuizMock.mockResolvedValue(quiz);

    await expect(generateMetadata(props("3"))).resolves.toEqual({
      title: "General knowledge",
      description: "Review this quiz's questions and correct answers.",
    });
  });

  it("returns a not-found title for invalid ids without calling the API", async () => {
    await expect(generateMetadata(props("abc"))).resolves.toEqual({ title: "Quiz not found" });
    expect(getQuizMock).not.toHaveBeenCalled();
  });

  it("returns not-found metadata when loading fails", async () => {
    getQuizMock.mockRejectedValue(new ApiError("Quiz not found", 404));

    await expect(generateMetadata(props("3"))).resolves.toEqual({
      title: "Quiz not found",
      description: "This quiz doesn't exist or has been deleted.",
    });
  });
});
