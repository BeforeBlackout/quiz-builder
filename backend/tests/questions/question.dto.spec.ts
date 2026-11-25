import { describe, expect, it } from "@jest/globals";

import { toQuestionDto } from "../../src/questions/question.dto.ts";

const base = { id: 1, position: 0, prompt: "p" };

type QuestionMapperInput = Parameters<typeof toQuestionDto>[0];

function row(overrides: Partial<QuestionMapperInput>): QuestionMapperInput {
  return {
    ...base,
    type: "BOOLEAN",
    booleanAnswer: null,
    textAnswer: null,
    options: [],
    ...overrides,
  };
}

describe("toQuestionDto", () => {
  it("keeps only the answer field that belongs to each question type", () => {
    expect(toQuestionDto(row({ type: "BOOLEAN", booleanAnswer: false }))).toEqual({
      ...base,
      type: "BOOLEAN",
      booleanAnswer: false,
    });
    expect(toQuestionDto(row({ type: "INPUT", textAnswer: "Paris" }))).toEqual({
      ...base,
      type: "INPUT",
      textAnswer: "Paris",
    });
    expect(
      toQuestionDto(
        row({
          type: "CHECKBOX",
          options: [{ id: 9, position: 0, text: "A", isCorrect: true }],
        }),
      ),
    ).toEqual({
      ...base,
      type: "CHECKBOX",
      options: [{ id: 9, position: 0, text: "A", isCorrect: true }],
    });
  });

  it("rejects a stored question that is missing its answer", () => {
    expect(() => toQuestionDto(row({ type: "BOOLEAN", booleanAnswer: null }))).toThrow(
      "Question 1 is BOOLEAN but has no booleanAnswer",
    );
    expect(() => toQuestionDto(row({ type: "INPUT", textAnswer: null }))).toThrow(
      "Question 1 is INPUT but has no textAnswer",
    );
  });
});
