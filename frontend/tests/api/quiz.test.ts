import { createQuiz, deleteQuiz, getQuiz, listQuizzes } from "@/api/quiz";
import type { CreateQuizPayload } from "@/schemas/quiz-schema";
import { request } from "@/utils/api";

jest.mock("@/utils/api", () => ({
  request: jest.fn().mockResolvedValue("response"),
}));

const requestMock = jest.mocked(request);

beforeEach(() => {
  requestMock.mockClear();
});

describe("quiz API", () => {
  it("lists quizzes", async () => {
    await expect(listQuizzes()).resolves.toBe("response");
    expect(requestMock).toHaveBeenCalledWith("/quizzes");
  });

  it("gets a quiz by id", async () => {
    await getQuiz(7);
    expect(requestMock).toHaveBeenCalledWith("/quizzes/7");
  });

  it("posts the payload as JSON when creating a quiz", async () => {
    const payload: CreateQuizPayload = {
      title: "Capitals",
      questions: [{ type: "BOOLEAN", prompt: "Paris is in France", booleanAnswer: true }],
    };

    await createQuiz(payload);

    expect(requestMock).toHaveBeenCalledWith("/quizzes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  });

  it("deletes a quiz by id", async () => {
    await deleteQuiz(3);
    expect(requestMock).toHaveBeenCalledWith("/quizzes/3", { method: "DELETE" });
  });
});
