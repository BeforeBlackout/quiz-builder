import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { NotFoundException } from "@nestjs/common";

jest.unstable_mockModule("../../src/prisma/db.ts", () => ({
  db: { close: async () => undefined },
}));

const createdAt = new Date("2026-01-01T00:00:00.000Z");
const updatedAt = new Date("2026-01-02T00:00:00.000Z");

const validBody = {
  title: "Quiz",
  questions: [
    { type: "BOOLEAN" as const, prompt: "Yes?", booleanAnswer: true },
    { type: "INPUT" as const, prompt: "Name?", textAnswer: "Ada" },
  ],
};

type QuizApi = {
  create: ReturnType<typeof jest.fn>;
  where: ReturnType<typeof jest.fn>;
  select: ReturnType<typeof jest.fn>;
  include: ReturnType<typeof jest.fn>;
  orderBy: ReturnType<typeof jest.fn>;
  all: ReturnType<typeof jest.fn>;
  first: ReturnType<typeof jest.fn>;
  delete: ReturnType<typeof jest.fn>;
};

function quizApi(): QuizApi {
  const api = {} as QuizApi;
  api.create = jest.fn(async () => ({ id: 7 }));
  api.where = jest.fn(() => api);
  api.select = jest.fn(() => api);
  api.include = jest.fn(() => api);
  api.orderBy = jest.fn(() => api);
  api.all = jest.fn(async () => []);
  api.first = jest.fn(async () => null);
  api.delete = jest.fn(async () => ({ id: 7 }));
  return api;
}

function harness() {
  const quiz = quizApi();
  const tx = { orm: { public: { Quiz: quiz } } };
  const prisma = {
    db: {
      transaction: jest.fn(async (run: (client: typeof tx) => Promise<number>) => run(tx)),
      orm: { public: { Quiz: quiz } },
    },
  };
  const questions = {
    create: jest.fn<
      (client: unknown, quizId: number, position: number, question: unknown) => Promise<void>
    >(async () => undefined),
  };
  return { quiz, tx, prisma, questions };
}

describe("QuizzesService", () => {
  let QuizzesService: typeof import("../../src/quizzes/quizzes.service.ts").QuizzesService;

  beforeAll(async () => {
    ({ QuizzesService } = await import("../../src/quizzes/quizzes.service.ts"));
  });

  function serviceFor(deps: ReturnType<typeof harness>) {
    return new QuizzesService(deps.prisma as never, deps.questions as never);
  }

  it("creates questions in order and returns the saved quiz", async () => {
    const deps = harness();
    deps.quiz.first.mockImplementation(async () => ({
      id: 7,
      title: "Quiz",
      createdAt,
      updatedAt,
      questions: [
        {
          id: 1,
          position: 0,
          type: "BOOLEAN",
          prompt: "Yes?",
          booleanAnswer: true,
          textAnswer: null,
          options: [],
        },
      ],
    }));
    const service = serviceFor(deps);

    await expect(service.create(validBody)).resolves.toEqual({
      id: 7,
      title: "Quiz",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
      questions: [
        {
          id: 1,
          position: 0,
          type: "BOOLEAN",
          prompt: "Yes?",
          booleanAnswer: true,
        },
      ],
    });
    expect(deps.quiz.create).toHaveBeenCalledWith({ title: "Quiz" });
    expect(deps.questions.create).toHaveBeenNthCalledWith(1, deps.tx, 7, 0, {
      type: "BOOLEAN",
      prompt: "Yes?",
      booleanAnswer: true,
    });
    expect(deps.questions.create).toHaveBeenNthCalledWith(2, deps.tx, 7, 1, {
      type: "INPUT",
      prompt: "Name?",
      textAnswer: "Ada",
    });
  });

  it("rejects a create when the saved quiz cannot be loaded", async () => {
    const deps = harness();
    const service = serviceFor(deps);

    await expect(service.create(validBody)).rejects.toThrow(NotFoundException);
    await expect(service.create(validBody)).rejects.toThrow("Quiz 7 was not found");
  });

  it("propagates a failure while saving a question", async () => {
    const deps = harness();
    deps.questions.create.mockImplementation(async () => {
      throw new Error("insert failed");
    });
    const service = serviceFor(deps);

    await expect(service.create(validBody)).rejects.toThrow("insert failed");
  });

  it("lists quizzes with their question counts", async () => {
    const deps = harness();
    deps.quiz.all.mockImplementation(async () => [
      { id: 2, title: "Newer", questions: 1 },
      { id: 1, title: "Older", questions: 4 },
    ]);
    const service = serviceFor(deps);

    await expect(service.list()).resolves.toEqual([
      { id: 2, title: "Newer", questionCount: 1 },
      { id: 1, title: "Older", questionCount: 4 },
    ]);
    expect(deps.quiz.select).toHaveBeenCalledWith("id", "title");
  });

  it("returns one quiz with nested options and ISO timestamps", async () => {
    const deps = harness();
    deps.quiz.first.mockImplementation(async () => ({
      id: 7,
      title: "Quiz",
      createdAt,
      updatedAt,
      questions: [
        {
          id: 1,
          position: 0,
          type: "CHECKBOX",
          prompt: "Pick",
          booleanAnswer: null,
          textAnswer: null,
          options: [{ id: 9, position: 0, text: "A", isCorrect: true }],
        },
      ],
    }));
    const service = serviceFor(deps);

    await expect(service.findOne(7)).resolves.toEqual({
      id: 7,
      title: "Quiz",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
      questions: [
        {
          id: 1,
          position: 0,
          type: "CHECKBOX",
          prompt: "Pick",
          options: [{ id: 9, position: 0, text: "A", isCorrect: true }],
        },
      ],
    });
    expect(deps.quiz.where).toHaveBeenCalledWith({ id: 7 });
    expect(deps.quiz.select).toHaveBeenCalledWith("id", "title", "createdAt", "updatedAt");
  });

  it("reports a missing quiz", async () => {
    const deps = harness();
    const service = serviceFor(deps);

    await expect(service.findOne(4)).rejects.toThrow(NotFoundException);
    await expect(service.findOne(4)).rejects.toThrow("Quiz 4 was not found");
  });

  it("deletes a quiz", async () => {
    const deps = harness();
    const service = serviceFor(deps);

    await expect(service.remove(7)).resolves.toBeUndefined();
    expect(deps.quiz.where).toHaveBeenCalledWith({ id: 7 });
  });

  it("reports a delete for a missing quiz", async () => {
    const deps = harness();
    deps.quiz.delete.mockImplementation(async () => null);
    const service = serviceFor(deps);

    await expect(service.remove(4)).rejects.toThrow("Quiz 4 was not found");
  });
});
