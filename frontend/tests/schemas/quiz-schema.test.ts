import { createQuizFormSchema, type CreateQuizForm } from "@/schemas/quiz-schema";
import { blankQuestion } from "@/utils/quiz";

type FormQuestion = CreateQuizForm["questions"][number];

function form(questions: Array<Partial<FormQuestion>>, title = "Quiz"): CreateQuizForm {
  return {
    title,
    questions: questions.map((overrides) => ({
      ...blankQuestion(),
      prompt: "A question",
      ...overrides,
    })),
  };
}

function issues(value: CreateQuizForm) {
  const result = createQuizFormSchema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.map((issue) => ({ path: issue.path, message: issue.message }));
}

describe("createQuizFormSchema", () => {
  it("accepts a valid quiz with every question type", () => {
    expect(
      issues(
        form([
          { type: "BOOLEAN" },
          { type: "INPUT", textAnswer: "Paris" },
          {
            type: "CHECKBOX",
            options: [
              { text: "A", isCorrect: true },
              { text: "B", isCorrect: false },
            ],
          },
        ]),
      ),
    ).toEqual([]);
  });

  it("requires a non-blank title", () => {
    expect(issues(form([{}], "   "))).toEqual([{ path: ["title"], message: "Title is required" }]);
  });

  it("rejects titles over 200 characters", () => {
    expect(issues(form([{}], "x".repeat(201)))).toEqual([
      { path: ["title"], message: "Keep the title under 200 characters" },
    ]);
  });

  it("requires at least one question", () => {
    expect(issues(form([]))).toEqual([
      { path: ["questions"], message: "Add at least one question" },
    ]);
  });

  it("requires a non-blank prompt", () => {
    expect(issues(form([{}, { prompt: "  " }]))).toEqual([
      { path: ["questions", 1, "prompt"], message: "Write the question" },
    ]);
  });

  it("requires an expected answer for input questions only", () => {
    expect(issues(form([{ type: "INPUT", textAnswer: " " }]))).toEqual([
      { path: ["questions", 0, "textAnswer"], message: "Add the expected answer" },
    ]);
    expect(issues(form([{ type: "BOOLEAN", textAnswer: "" }]))).toEqual([]);
  });

  it("requires at least two filled options for checkbox questions", () => {
    expect(
      issues(
        form([
          {
            type: "CHECKBOX",
            options: [
              { text: "Only one", isCorrect: true },
              { text: "   ", isCorrect: false },
            ],
          },
        ]),
      ),
    ).toEqual([{ path: ["questions", 0, "options"], message: "Add at least 2 options" }]);
  });

  it("requires a correct option among the filled checkbox options", () => {
    expect(
      issues(
        form([
          {
            type: "CHECKBOX",
            options: [
              { text: "", isCorrect: true },
              { text: "A", isCorrect: false },
              { text: "B", isCorrect: false },
            ],
          },
        ]),
      ),
    ).toEqual([{ path: ["questions", 0, "options"], message: "Mark at least one correct option" }]);
  });

  it("does not validate checkbox options when the question is another type", () => {
    expect(issues(form([{ type: "BOOLEAN", options: [{ text: "", isCorrect: false }] }]))).toEqual(
      [],
    );
  });
});
