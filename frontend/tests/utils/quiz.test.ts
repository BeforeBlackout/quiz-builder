import type { QuestionFormValues } from "@/schemas/quiz-schema";
import { blankQuestion, countByType, parseQuizId, toCreateQuizPayload } from "@/utils/quiz";

function question(overrides: Partial<QuestionFormValues>) {
  return { ...blankQuestion(), ...overrides };
}

describe("blankQuestion", () => {
  it("starts as a boolean question with two checkbox options ready", () => {
    expect(blankQuestion()).toEqual({
      type: "BOOLEAN",
      prompt: "",
      booleanAnswer: true,
      textAnswer: "",
      options: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
      ],
    });
  });

  it("returns a fresh object on each call", () => {
    const first = blankQuestion();
    first.options[0].text = "changed";

    expect(blankQuestion().options[0].text).toBe("");
  });
});

describe("parseQuizId", () => {
  it.each([
    ["1", 1],
    ["42", 42],
    ["2147483647", 2_147_483_647],
  ])("parses %p", (raw, expected) => {
    expect(parseQuizId(raw)).toBe(expected);
  });

  it.each(["", "0", "01", "-1", "1.5", "abc", "1e3", "2147483648"])("rejects %p", (raw) => {
    expect(parseQuizId(raw)).toBeNull();
  });
});

describe("countByType", () => {
  it("counts every question type, including unused ones", () => {
    expect(countByType([{ type: "BOOLEAN" }, { type: "CHECKBOX" }, { type: "BOOLEAN" }])).toEqual({
      BOOLEAN: 2,
      INPUT: 0,
      CHECKBOX: 1,
    });
  });

  it("skips missing entries while the form is still filling in", () => {
    expect(countByType([undefined, {}, { type: "INPUT" }])).toEqual({
      BOOLEAN: 0,
      INPUT: 1,
      CHECKBOX: 0,
    });
  });
});

describe("toCreateQuizPayload", () => {
  it("trims the title and prompts", () => {
    const payload = toCreateQuizPayload({
      title: "  Geography  ",
      questions: [question({ prompt: "  Is the Earth round?  " })],
    });

    expect(payload.title).toBe("Geography");
    expect(payload.questions[0].prompt).toBe("Is the Earth round?");
  });

  it("keeps only the boolean answer for boolean questions", () => {
    const payload = toCreateQuizPayload({
      title: "Quiz",
      questions: [question({ prompt: "Q", booleanAnswer: false, textAnswer: "ignored" })],
    });

    expect(payload.questions[0]).toEqual({ type: "BOOLEAN", prompt: "Q", booleanAnswer: false });
  });

  it("keeps only the trimmed text answer for input questions", () => {
    const payload = toCreateQuizPayload({
      title: "Quiz",
      questions: [question({ type: "INPUT", prompt: "Q", textAnswer: "  Paris  " })],
    });

    expect(payload.questions[0]).toEqual({ type: "INPUT", prompt: "Q", textAnswer: "Paris" });
  });

  it("drops blank options and trims the rest for checkbox questions", () => {
    const payload = toCreateQuizPayload({
      title: "Quiz",
      questions: [
        question({
          type: "CHECKBOX",
          prompt: "Q",
          options: [
            { text: " Red ", isCorrect: true },
            { text: "   ", isCorrect: true },
            { text: "Blue", isCorrect: false },
          ],
        }),
      ],
    });

    expect(payload.questions[0]).toEqual({
      type: "CHECKBOX",
      prompt: "Q",
      options: [
        { text: "Red", isCorrect: true },
        { text: "Blue", isCorrect: false },
      ],
    });
  });
});
