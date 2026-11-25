import { describe, expect, it, jest } from "@jest/globals";

import { OptionsService } from "../../src/options/options.service.ts";
import { QuestionsService } from "../../src/questions/questions.service.ts";

type CreateQuestion = (input: unknown) => Promise<{ id: number }>;

function clientWith(create: jest.Mock<CreateQuestion>) {
  return { orm: { public: { Question: { create } } } } as never;
}

describe("QuestionsService", () => {
  it("stores a true/false answer and skips options", async () => {
    const create = jest.fn<CreateQuestion>(async () => ({ id: 4 }));
    const options = {
      createMany: jest.fn<(client: unknown, questionId: number, options: unknown) => Promise<void>>(
        async () => undefined,
      ),
    };
    const service = new QuestionsService(options as unknown as OptionsService);

    await service.create(clientWith(create), 3, 0, {
      type: "BOOLEAN",
      prompt: "The Pacific is the largest ocean.",
      booleanAnswer: true,
    });

    expect(create).toHaveBeenCalledWith({
      quizId: 3,
      position: 0,
      type: "BOOLEAN",
      prompt: "The Pacific is the largest ocean.",
      booleanAnswer: true,
      textAnswer: null,
    });
    expect(options.createMany).not.toHaveBeenCalled();
  });

  it("stores a short-text answer and skips options", async () => {
    const create = jest.fn<CreateQuestion>(async () => ({ id: 5 }));
    const options = {
      createMany: jest.fn<(client: unknown, questionId: number, options: unknown) => Promise<void>>(
        async () => undefined,
      ),
    };
    const service = new QuestionsService(options as unknown as OptionsService);

    await service.create(clientWith(create), 3, 1, {
      type: "INPUT",
      prompt: "Capital of Japan?",
      textAnswer: "Tokyo",
    });

    expect(create).toHaveBeenCalledWith({
      quizId: 3,
      position: 1,
      type: "INPUT",
      prompt: "Capital of Japan?",
      booleanAnswer: null,
      textAnswer: "Tokyo",
    });
    expect(options.createMany).not.toHaveBeenCalled();
  });

  it("stores a checkbox question and its options", async () => {
    const create = jest.fn<CreateQuestion>(async () => ({ id: 6 }));
    const options = {
      createMany: jest.fn<(client: unknown, questionId: number, options: unknown) => Promise<void>>(
        async () => undefined,
      ),
    };
    const service = new QuestionsService(options as unknown as OptionsService);
    const answerOptions = [
      { text: "Red", isCorrect: true },
      { text: "Green", isCorrect: false },
    ];
    const db = clientWith(create);

    await service.create(db, 3, 2, {
      type: "CHECKBOX",
      prompt: "Primary colors?",
      options: answerOptions,
    });

    expect(create).toHaveBeenCalledWith({
      quizId: 3,
      position: 2,
      type: "CHECKBOX",
      prompt: "Primary colors?",
      booleanAnswer: null,
      textAnswer: null,
    });
    expect(options.createMany).toHaveBeenCalledWith(db, 6, answerOptions);
  });
});
