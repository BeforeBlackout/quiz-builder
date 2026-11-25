import { formatDate, pad2, pluralize } from "@/utils/format";

describe("pad2", () => {
  it.each([
    [0, "00"],
    [7, "07"],
    [12, "12"],
    [120, "120"],
  ])("pads %p to %p", (value, expected) => {
    expect(pad2(value)).toBe(expected);
  });
});

describe("pluralize", () => {
  it.each([
    [0, "0 questions"],
    [1, "1 question"],
    [2, "2 questions"],
  ])("formats %p", (count, expected) => {
    expect(pluralize(count, "question")).toBe(expected);
  });

  it("pluralizes the last word of a phrase", () => {
    expect(pluralize(3, "correct answer")).toBe("3 correct answers");
  });
});

describe("formatDate", () => {
  it("formats an ISO date as a short US date", () => {
    expect(formatDate("2026-01-05T12:00:00.000Z")).toBe("Jan 5, 2026");
  });
});
