import { describe, expect, it } from "@jest/globals";

import { createQuizSchema } from "../../src/quizzes/create-quiz.schema.ts";

const booleanQuestion = {
  type: "BOOLEAN" as const,
  prompt: "Ready?",
  booleanAnswer: true,
};

function issues(body: unknown) {
  const parsed = createQuizSchema.safeParse(body);
  if (parsed.success) {
    throw new Error("expected the quiz body to fail validation");
  }
  return parsed.error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

describe("createQuizSchema", () => {
  it("trims text and accepts every question type", () => {
    expect(
      createQuizSchema.parse({
        title: "  Mixed  ",
        questions: [
          { type: "BOOLEAN", prompt: "  Yes?  ", booleanAnswer: false },
          { type: "INPUT", prompt: "  City?  ", textAnswer: "  Paris  " },
          {
            type: "CHECKBOX",
            prompt: "  Colors?  ",
            options: [
              { text: "  Red  ", isCorrect: true },
              { text: "Blue", isCorrect: false },
            ],
          },
        ],
      }),
    ).toEqual({
      title: "Mixed",
      questions: [
        { type: "BOOLEAN", prompt: "Yes?", booleanAnswer: false },
        { type: "INPUT", prompt: "City?", textAnswer: "Paris" },
        {
          type: "CHECKBOX",
          prompt: "Colors?",
          options: [
            { text: "Red", isCorrect: true },
            { text: "Blue", isCorrect: false },
          ],
        },
      ],
    });
  });

  it("accepts the largest allowed title, prompt, answer, question count, and option count", () => {
    expect(
      createQuizSchema.safeParse({
        title: "a".repeat(200),
        questions: Array.from({ length: 50 }, () => booleanQuestion),
      }).success,
    ).toBe(true);
    expect(
      createQuizSchema.safeParse({
        title: "t",
        questions: [
          {
            type: "CHECKBOX",
            prompt: "a".repeat(500),
            options: Array.from({ length: 12 }, () => ({ text: "a".repeat(200), isCorrect: true })),
          },
        ],
      }).success,
    ).toBe(true);
    expect(
      createQuizSchema.safeParse({
        title: "t",
        questions: [{ type: "INPUT", prompt: "p", textAnswer: "a".repeat(300) }],
      }).success,
    ).toBe(true);
  });

  it("requires a title and at least one question", () => {
    expect(issues({})).toEqual([
      { path: "title", message: "Invalid input: expected string, received undefined" },
      { path: "questions", message: "Invalid input: expected array, received undefined" },
    ]);
    expect(issues({ title: "   ", questions: [] })).toEqual([
      { path: "title", message: "Title is required" },
      { path: "questions", message: "Add at least one question" },
    ]);
  });

  it("rejects an unknown question type", () => {
    expect(issues({ title: "t", questions: [{ type: "NOPE", prompt: "p" }] })).toEqual([
      {
        path: "questions.0.type",
        message: "Invalid discriminator value. Expected 'BOOLEAN' | 'INPUT' | 'CHECKBOX'",
      },
    ]);
  });

  it("checks boolean and short-text answers", () => {
    expect(
      issues({ title: "t", questions: [{ type: "BOOLEAN", prompt: "", booleanAnswer: "yes" }] }),
    ).toEqual([
      { path: "questions.0.prompt", message: "Question text is required" },
      {
        path: "questions.0.booleanAnswer",
        message: "Invalid input: expected boolean, received string",
      },
    ]);
    expect(
      issues({ title: "t", questions: [{ type: "INPUT", prompt: "p", textAnswer: "  " }] }),
    ).toEqual([{ path: "questions.0.textAnswer", message: "Expected answer is required" }]);
  });

  it("requires a checkbox question to have a correct option", () => {
    expect(
      issues({
        title: "t",
        questions: [
          {
            type: "CHECKBOX",
            prompt: "p",
            options: [
              { text: "A", isCorrect: false },
              { text: "B", isCorrect: false },
            ],
          },
        ],
      }),
    ).toEqual([{ path: "questions.0.options", message: "Mark at least one correct option" }]);
  });

  it("requires a checkbox question to have at least two options", () => {
    expect(
      issues({
        title: "t",
        questions: [{ type: "CHECKBOX", prompt: "p", options: [{ text: "A", isCorrect: true }] }],
      }),
    ).toEqual([{ path: "questions.0.options", message: "Add at least 2 options" }]);
    expect(
      issues({
        title: "t",
        questions: [{ type: "CHECKBOX", prompt: "p", options: [] }],
      }),
    ).toEqual([
      { path: "questions.0.options", message: "Add at least 2 options" },
      { path: "questions.0.options", message: "Mark at least one correct option" },
    ]);
  });

  it("rejects empty option text", () => {
    expect(
      issues({
        title: "t",
        questions: [
          {
            type: "CHECKBOX",
            prompt: "p",
            options: [
              { text: " ", isCorrect: true },
              { text: "B", isCorrect: false },
            ],
          },
        ],
      }),
    ).toEqual([{ path: "questions.0.options.0.text", message: "Option text is required" }]);
  });

  it("rejects values past the size limits", () => {
    expect(issues({ title: "a".repeat(201), questions: [booleanQuestion] })).toEqual([
      { path: "title", message: "Too big: expected string to have <=200 characters" },
    ]);
    expect(
      issues({
        title: "t",
        questions: [{ ...booleanQuestion, prompt: "a".repeat(501) }],
      }),
    ).toEqual([
      { path: "questions.0.prompt", message: "Too big: expected string to have <=500 characters" },
    ]);
    expect(
      issues({
        title: "t",
        questions: [{ type: "INPUT", prompt: "p", textAnswer: "a".repeat(301) }],
      }),
    ).toEqual([
      {
        path: "questions.0.textAnswer",
        message: "Too big: expected string to have <=300 characters",
      },
    ]);
    expect(
      issues({
        title: "t",
        questions: Array.from({ length: 51 }, () => booleanQuestion),
      }),
    ).toEqual([{ path: "questions", message: "Too big: expected array to have <=50 items" }]);
    expect(
      issues({
        title: "t",
        questions: [
          {
            type: "CHECKBOX",
            prompt: "p",
            options: [
              { text: "a".repeat(201), isCorrect: true },
              { text: "B", isCorrect: false },
            ],
          },
        ],
      }),
    ).toEqual([
      {
        path: "questions.0.options.0.text",
        message: "Too big: expected string to have <=200 characters",
      },
    ]);
    expect(
      issues({
        title: "t",
        questions: [
          {
            type: "CHECKBOX",
            prompt: "p",
            options: Array.from({ length: 13 }, () => ({ text: "A", isCorrect: true })),
          },
        ],
      }),
    ).toEqual([
      { path: "questions.0.options", message: "Too big: expected array to have <=12 items" },
    ]);
  });
});
